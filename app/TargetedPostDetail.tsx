import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import ActionModal from '../components/ActionModal';
import CommonHeader from '../components/CommonHeader';
import { addEnergyPoint, getPost, savePost } from '../services/api';
import { getImageDisplayUrl } from '../utils/imageUtils';
import { stripHashtags } from '../utils/tags';

const { width } = Dimensions.get('window');

// --- 工具函数：计算圆弧路径 ---
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  const d = [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    "L", x, y,
    "L", start.x, start.y,
  ].join(" ");
  return d;
};

// --- 倒计时圆环组件 ---
const TimerCircle = ({ totalTime, onFinish }: { totalTime: number; onFinish: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [angle, setAngle] = useState(0);
  const [isRefilling, setIsRefilling] = useState(false);
  const innerScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (timeLeft > 0 && !isRefilling) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 0.1;
          if (newTime <= 0) {
            if (interval) clearInterval(interval);
            startRefillAnimation();
            return 0;
          }
          const progress = (totalTime - newTime) / totalTime;
          setAngle(progress * 360);
          return newTime;
        });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeLeft, isRefilling, totalTime]);

  const startRefillAnimation = () => {
    setIsRefilling(true);
    setAngle(360);

    let tempAngle = 360;
    const animateRefill = () => {
      tempAngle -= 15;
      if (tempAngle <= 0) {
        setAngle(0);
        startCenterFillAnimation();
      } else {
        setAngle(tempAngle);
        requestAnimationFrame(animateRefill);
      }
    };
    requestAnimationFrame(animateRefill);
  };

  const startCenterFillAnimation = () => {
    Animated.timing(innerScale, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onFinish();
    });
  };

  const radius = 35;
  const center = radius;
  
  return (
    <View style={styles.timerContainer}>
      <LinearGradient
        colors={['#FFD700', '#FF8C00']}
        start={{x: 0, y: 0}} 
        end={{x: 1, y: 0}}
        style={{ width: radius * 2, height: radius * 2, borderRadius: radius }}
      />

      <View style={[StyleSheet.absoluteFill, { transform: [{ rotate: '-90deg' }] }]}>
        <Svg height={radius * 2} width={radius * 2}>
          {angle > 0 && angle < 360 && (
            <Path
              d={describeArc(center, center, radius + 2, 0, angle)}
              fill="#FFFFFF"
            />
          )}
          {angle >= 360 && (
            <Path d={describeArc(center, center, radius + 2, 0, 359.99)} fill="#FFFFFF" />
          )}
        </Svg>
      </View>

      <Animated.View style={[
        styles.innerWhiteCircle, 
        { transform: [{ scale: innerScale }] }
      ]}>
        <Text style={styles.timerText}>
          {Math.ceil(timeLeft) > 0 ? Math.ceil(timeLeft) + "s" : "Done"}
        </Text>
      </Animated.View>
    </View>
  );
};

// 帖子数据类型
interface TargetedPostDetail {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  timestamp: string;
  images?: string[];
  tags: string[];
  readTime?: string;
  expectedDuration: number;
  energy: number;
}

// 解析阅读时间
const parseReadTime = (readTime: string): number => {
  const match = readTime.match(/(\d+)([smh])/);
  if (!match) return 30;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    default: return 30;
  }
};

export default function TargetedPostDetail() {
  const { postId } = useLocalSearchParams();
  const [post, setPost] = useState<TargetedPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [energy, setEnergy] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [energyAdded, setEnergyAdded] = useState(false); // 新增：记录是否已添加能量
  
  // 添加弹窗状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'delete' | 'bookmark'>('bookmark');
  
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadPostDetails();
    loadUserEnergy(); // 新增：加载用户能量
  }, [postId]);

  // 新增：加载用户当前能量值
  const loadUserEnergy = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      // 这里可以调用 getEnergyPoint API 获取当前能量
      // const result = await getEnergyPoint(token);
      // if (result.success) {
      //   setEnergy(result.data.energy_point || 0);
      // }
    } catch (error) {
      console.error('Failed to load user energy:', error);
    }
  };

  const formatPostData = useCallback((apiData: any, postId: string): TargetedPostDetail => {
    const post = apiData.post || apiData;
    
    let tags: string[] = [];
    if (post.tags) {
      if (typeof post.tags === 'string' && post.tags.trim()) {
        tags = post.tags.split(',').map((tag: string) => {
          const cleanTag = tag.trim();
          if (!cleanTag) return null;
          return cleanTag.startsWith('#') ? cleanTag : `#${cleanTag}`;
        }).filter(Boolean);
      } else if (Array.isArray(post.tags)) {
        tags = post.tags.map((tag: string) => {
          const cleanTag = tag.trim();
          if (!cleanTag) return null;
          return cleanTag.startsWith('#') ? cleanTag : `#${cleanTag}`;
        }).filter(Boolean);
      }
    }
    
    const readTime = post.readTime || '30s';
    const expectedDuration = parseReadTime(readTime);
    const calculatedEnergy = Math.floor(expectedDuration / 60) * 10 || 20;
    
    return {
      id: post.postid || post.id || postId,
      title: post.title ?? '无标题',
      content: stripHashtags(post.content) || '',
      author: {
        name: post.cover_name || post.author || post.username || 'Anonymous',
        avatar: post.avatar,
      },
      timestamp: post.createtime || post.created_at || post.timestamp || new Date().toISOString(),
      images: post.images || (post.image_url ? [getImageDisplayUrl(post.image_url)] : []),
      tags: tags,
      readTime: readTime,
      expectedDuration: expectedDuration,
      energy: calculatedEnergy,
    };
  }, []);

  const getMockPostData = useCallback((postId: string): TargetedPostDetail => {
    const mockPosts = [
      {
        id: '1',
        title: 'acct 101 pq sub 求组队',
        content: '如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如...',
        author: { name: 'Tomas' },
        readTime: '30s',
        image_url: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/egC8MCMzoa/yulzzgwh_expires_30_days.png',
      },
      {
        id: '2',
        title: '第九屆「任國榮先生生命科學講座⋯⋯',
        content: '主講：沈祖堯教授\n報名鏈接：https://aaa-bbb.ccc',
        author: { name: 'cuhk_sls' },
        readTime: '45s',
      },
    ];

    const foundPost = mockPosts.find(p => p.id === postId) || mockPosts[0];
    const readTime = foundPost.readTime;
    const expectedDuration = parseReadTime(readTime);
    
    return {
      id: postId,
      title: foundPost.title,
      content: foundPost.content,
      author: foundPost.author,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      images: foundPost.image_url ? Array(9).fill(foundPost.image_url) : [],
      tags: ['#ACCT101', '#Study'],
      readTime: readTime,
      expectedDuration: expectedDuration,
      energy: Math.floor(expectedDuration / 60) * 10 || 20,
    };
  }, []);

  const loadPostDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (token && postId) {
        try {
          console.log('📡 Loading post details for:', postId);
          const result = await getPost(postId as string, token);
          
          console.log('✅ API Response:', result);
          
          if (result.success && result.data) {
            const formattedPost = formatPostData(result.data, postId as string);
            setPost(formattedPost);
            console.log('✅ Post loaded successfully');
          } else {
            console.warn('⚠️ API failed, using mock data');
            const mockPost = getMockPostData(postId as string);
            setPost(mockPost);
          }
        } catch (apiError) {
          console.error('❌ API error:', apiError);
          const mockPost = getMockPostData(postId as string);
          setPost(mockPost);
        }
      } else {
        console.warn('⚠️ No token or postId, using mock data');
        const mockPost = getMockPostData((postId as string) || '1');
        setPost(mockPost);
      }
    } catch (error) {
      console.error('❌ Failed to load post:', error);
      const mockPost = getMockPostData((postId as string) || '1');
      setPost(mockPost);
    } finally {
      setLoading(false);
    }
  }, [postId, formatPostData, getMockPostData]);

  // ✅ 更新：倒计时完成后调用 API 添加能量
  const handleTimerFinish = async () => {
    if (!post || energyAdded) {
      console.log('⏭️ Energy already added or no post data');
      return;
    }
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (token && post.id) {
        console.log('📡 Adding energy point:', {
          postId: post.id,
          score: post.energy
        });
        
        const result = await addEnergyPoint(post.id, post.energy, token);
        
        console.log('✅ Add energy point result:', result);
        
        if (result.success) {
          console.log('✅ Energy added successfully');
          setEnergyAdded(true); // 标记已添加
          
          // 播放动画
          floatAnim.setValue(0);
          fadeAnim.setValue(1);

          Animated.parallel([
            Animated.timing(floatAnim, {
              toValue: -30,
              duration: 800,
              useNativeDriver: true,
              easing: Easing.out(Easing.ease)
            }),
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
              delay: 200,
            })
          ]).start(() => {
            // 更新本地能量显示
            if (result.data?.energy_point !== undefined) {
              setEnergy(result.data.energy_point);
            } else {
              setEnergy(prev => prev + post.energy);
            }
          });
        } else {
          console.warn('⚠️ Failed to add energy:', result.message);
          Alert.alert('提示', '添加能量失败，请稍后重试');
        }
      } else {
        console.warn('⚠️ No token or post ID, skipping energy add');
        // 没有 token，仅播放动画
        floatAnim.setValue(0);
        fadeAnim.setValue(1);

        Animated.parallel([
          Animated.timing(floatAnim, {
            toValue: -30,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease)
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
            delay: 200,
          })
        ]).start(() => {
          setEnergy(prev => prev + post.energy);
        });
      }
    } catch (error) {
      console.error('❌ Error adding energy:', error);
      Alert.alert('错误', '添加能量时发生错误');
    }
  };

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const handleNotInterested = () => {
    console.log('Not interested clicked');
    setModalType('delete');
    setModalVisible(true);
    console.log('Modal should be visible now');
    
    // 延迟返回，让用户看到弹窗
    setTimeout(() => {
      setModalVisible(false);
      setTimeout(() => {
        router.back();
      }, 300);
    }, 1500);
  };

  // ✅ 更新：收藏功能接入 API
  const handleInterested = async () => {
    console.log('Interested clicked, isSaved:', isSaved);
    
    if (!isSaved) {
      try {
        const token = await AsyncStorage.getItem('userToken');
        
        if (token && post?.id) {
          console.log('📡 Saving post:', post.id);
          
          const result = await savePost(post.id, token);
          
          console.log('✅ Save post result:', result);
          
          if (result.success) {
            console.log('✅ Post saved successfully');
            setIsSaved(true);
            setModalType('bookmark');
            setModalVisible(true);
            
            // 1.5秒后自动关闭弹窗
            setTimeout(() => {
              setModalVisible(false);
            }, 1500);
          } else if (result.message === 'already_saved') {
            console.log('ℹ️ Post already saved');
            setIsSaved(true);
            Alert.alert('提示', '该帖子已经在收藏列表中');
          } else {
            console.warn('⚠️ Failed to save post:', result.message);
            Alert.alert('提示', result.message || '收藏失败，请稍后重试');
          }
        } else {
          console.warn('⚠️ No token or post ID, showing modal only');
          // 没有 token，仅显示弹窗
          setIsSaved(true);
          setModalType('bookmark');
          setModalVisible(true);
          
          setTimeout(() => {
            setModalVisible(false);
          }, 1500);
        }
      } catch (error) {
        console.error('❌ Error saving post:', error);
        Alert.alert('错误', '收藏时发生错误');
      }
    } else {
      // 如果已经收藏，直接取消收藏（本地状态）
      console.log('ℹ️ Unsaving post (local only)');
      setIsSaved(false);
    }
  };

  const handleModalClose = () => {
    console.log('Modal close clicked');
    setModalVisible(false);
  };

  if (loading || !post) {
    return (
      <SafeAreaProvider>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <CommonHeader 
            onBack={handleBack}
            title="Targeted Post Details"
            showMore={false}
          />
          <View style={styles.loadingContainer}>
            <Text>Loading...</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Energy */}
          <View style={styles.titleBar}>
            <TouchableOpacity onPress={handleBack}>
              <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
            
            <Text style={styles.pageTitle}>信息详情</Text>
            
            <View>
              <View style={styles.energyBadge}>
                <Image
                  source={require('../assets/images/energy.png')}
                  style={styles.energyIcon}
                />
                <Text style={styles.energyText}>{energy}</Text>
              </View>
              
              <Animated.View style={[
                styles.floatingScore, 
                { 
                  opacity: fadeAnim,
                  transform: [{ translateY: floatAnim }] 
                }
              ]}>
                <Text style={styles.floatingScoreText}>+{post.energy}</Text>
              </Animated.View>
            </View>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarText}>
                {post.author.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.userName}>{post.author.name}</Text>
              <Text style={styles.postDate}>
                {new Date(post.timestamp).toLocaleDateString()} {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>{post.title}</Text>
            <Text style={styles.contentText}>{post.content}</Text>
          </View>

          {/* Image Grid */}
          {post.images && post.images.length > 0 && (
            <View style={styles.gridContainer}>
              {post.images.slice(0, 9).map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: img }}
                  resizeMode="cover"
                  style={styles.gridImage}
                />
              ))}
            </View>
          )}
          
          <View style={{height: 120}} />
        </ScrollView>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={styles.bottomIconGroup}
            onPress={handleNotInterested}
          >
            <Image
              source={require('../assets/images/not_interested.png')}
              style={styles.actionIcon}
              resizeMode="contain"
            />
            <Text style={styles.bottomText}>不喜欢</Text>
          </TouchableOpacity>
          
          <View style={styles.timerWrapper}>
            <TimerCircle 
              totalTime={post.expectedDuration} 
              onFinish={handleTimerFinish} 
            />
          </View>

          <TouchableOpacity 
            style={styles.bottomIconGroup}
            onPress={handleInterested}
          >
            <Image
              source={isSaved 
                ? require('../assets/images/save.png')
                : require('../assets/images/save1.png')
              }
              style={styles.actionIcon}
              resizeMode="contain"
            />
            <Text style={styles.bottomText}>
              {isSaved ? '已收藏' : '感兴趣'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 弹窗 */}
        <ActionModal
          visible={modalVisible}
          onClose={handleModalClose}
          type={modalType}
          title={modalType === 'delete' ? '已标记为不感兴趣' : '已添加到收藏'}
          message={modalType === 'delete' ? '我们会减少类似内容的推荐' : '你可以在"我的收藏"中查看'}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 1,
  },
  backButton: {
    fontSize: 18,
    color: '#475569',
  },
  pageTitle: {
    color: '#475569',
    fontSize: 18,
    fontWeight: 'bold',
  },
  energyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC107',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  energyIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  energyText: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flexDirection: 'row',
    marginBottom: 15,
    marginHorizontal: 20,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  authorAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  authorInfo: {
    paddingVertical: 2,
  },
  userName: {
    color: '#475569',
    fontSize: 14,
    fontWeight: 'bold',
  },
  postDate: {
    color: '#ACB1C6',
    fontSize: 12,
    marginTop: 2,
  },
  contentContainer: {
    marginBottom: 15,
    marginHorizontal: 20,
  },
  contentTitle: {
    color: '#475569',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contentText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 22,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 15,
  },
  gridImage: {
    width: (width - 30 - 20) / 3,
    height: (width - 30 - 20) / 3,
    margin: 3,
    borderRadius: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  bottomIconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    width: 20,
    height: 20,
  },
  iconEmoji: {
    fontSize: 20,
  },
  bottomText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  timerWrapper: {
    position: 'absolute',
    top: -35,
    left: width / 2 - 35,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  innerWhiteCircle: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  floatingScore: {
    position: 'absolute',
    top: -20,
    right: 0,
    width: 50,
    alignItems: 'center',
  },
  floatingScoreText: {
    fontSize: 20,
    color: '#FF8C00',
    fontWeight: 'bold',
  },
});