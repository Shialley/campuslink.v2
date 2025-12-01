import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import CommonHeader from '@/components/CommonHeader';
import { getUserPosts } from '@/services/api';

const { width: screenWidth } = Dimensions.get('window');

// 帖子数据类型
interface Post {
  id: string;
  title: string;
  content: string;
  time: string;
  likeCount: number;
  commentCount?: number;
  shareCount?: number;
  saveCount?: number; // 新增收藏数量
  author?: string;
  avatar?: string;
  readTime?: string;
  energyCount?: number;
  type: 'targeted' | 'normal';
  isLiked?: boolean; // 新增：是否已点赞
  isSaved?: boolean; // 新增：是否已收藏
}

export default function PreviousPostsScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<'targeted' | 'normal'>('targeted');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 滑动手势相关
  const translateX = useRef(new Animated.Value(0)).current;
  const indicatorTranslateX = useRef(new Animated.Value(0)).current;
  const currentCategoryRef = useRef(selectedCategory);

  // 数据状态
  const [targetedPosts, setTargetedPosts] = useState<Post[]>([]);
  const [normalPosts, setNormalPosts] = useState<Post[]>([]);

  // 获取分类的索引
  const getCategoryIndex = (category: 'targeted' | 'normal') => {
    return category === 'targeted' ? 0 : 1;
  };

  // 获取索引对应的分类
  const getCategoryByIndex = (index: number): 'targeted' | 'normal' => {
    return index === 0 ? 'targeted' : 'normal';
  };

  // 更新指示器位置函数
  const updateIndicatorPosition = (category: 'targeted' | 'normal', animated: boolean = true) => {
    const index = getCategoryIndex(category);
    const targetPosition = (screenWidth / 2) * index;
    
    if (animated) {
      Animated.spring(indicatorTranslateX, {
        toValue: targetPosition,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
      }).start();
    } else {
      indicatorTranslateX.setValue(targetPosition);
    }
  };

  // 更新 ref 当分类改变时
  useEffect(() => {
    currentCategoryRef.current = selectedCategory;
    updateIndicatorPosition(selectedCategory, true);
  }, [selectedCategory]);

  // 初始化指示器位置
  useEffect(() => {
    setTimeout(() => {
      updateIndicatorPosition('targeted', false);
    }, 0);
  }, []);

  // 加载帖子数据 - 修复数据结构和函数缺失问题
  const loadPosts = async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = await AsyncStorage.getItem('userToken');
      
      if (token) {
        try {
          console.log('Loading user posts from API...');
          const userPostsResult = await getUserPosts(1, token);
          
          console.log('getUserPosts result:', userPostsResult);
          
          // 修复数据结构兼容性 - 根据实际API返回结构调整
          let postsList: any[] = [];
          
          if (Array.isArray(userPostsResult)) {
            // 如果直接返回数组
            postsList = userPostsResult;
          } else if (userPostsResult && typeof userPostsResult === 'object') {
            // 如果是 ApiResponse 对象
            if (userPostsResult.success) {
              // 根据实际API返回结构，data 字段直接是数组
              const raw = userPostsResult.data;
              postsList = Array.isArray(raw) ? raw : (raw?.posts ?? raw?.data ?? []);
            }
          }
          
          console.log('Extracted posts list:', postsList.length, 'posts');
          
          if (postsList.length > 0) {
            console.log('User posts loaded successfully:', postsList.length);
            
            // 分离 targeted 和 normal 帖子
            const targetedPostsData: Post[] = [];
            const normalPostsData: Post[] = [];
            
            // 在 loadPosts 函数中修复头像处理逻辑
            postsList.forEach((post: any) => {
              const content = post.content || '';
              const isTargeted = content.toLowerCase().includes('#targeted');
              
              // 生成更可靠的头像 URL
              const getAvatarUrl = (postid: string, author: string) => {
                // 首先尝试使用 API 返回的 avatar
                if (post.avatar && post.avatar.startsWith('http')) {
                  return post.avatar;
                }
                
                // 如果没有头像，使用可靠的默认头像服务
                // 使用作者名的哈希值来确保同一作者总是显示相同头像
                const hash = author.split('').reduce((a, b) => {
                  a = ((a << 5) - a) + b.charCodeAt(0);
                  return a & a;
                }, 0);
                const avatarIndex = Math.abs(hash) % 70 + 1; // 1-70 的范围
                
                return `https://i.pravatar.cc/150?img=${avatarIndex}`;
              };
              
              // 更新postData的likes字段处理
              const postData: Post = {
                id: post.postid || post.id,
                title: extractTitle(post.content) || 'Untitled',
                content: post.content || '',
                time: formatPostTime(post.createtime || new Date().toISOString()),
                likeCount: post.like || 0, // ✅ 确保使用API返回的like字段
                saveCount: post.bookmarks || 0,
                commentCount: post.comments || 0,
                shareCount: 0,
                author: post.cover_name || 'Anonymous',
                avatar: getAvatarUrl(post.postid, post.cover_name || 'Anonymous'), // 使用新的头像生成逻辑
                readTime: calculateReadTime(post.content || ''),
                energyCount: calculateEnergyCount(post.content || ''),
                type: isTargeted ? 'targeted' : 'normal',
                isLiked: false,
                isSaved: false,
              };
              
              if (isTargeted) {
                targetedPostsData.push(postData);
              } else {
                normalPostsData.push(postData);
              }
            });
            
            console.log(`Found ${targetedPostsData.length} targeted posts and ${normalPostsData.length} normal posts`);
            setTargetedPosts(targetedPostsData);
            setNormalPosts(normalPostsData);
            
          } else {
            console.log('No posts found, using mock data');
            setTargetedPosts(getMockTargetedPosts());
            setNormalPosts(getMockNormalPosts());
          }
          
        } catch (apiError) {
          console.log('Posts API error, using mock data:', apiError);
          setTargetedPosts(getMockTargetedPosts());
          setNormalPosts(getMockNormalPosts());
        }
      } else {
        console.log('No token, using mock data');
        setTargetedPosts(getMockTargetedPosts());
        setNormalPosts(getMockNormalPosts());
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setTargetedPosts(getMockTargetedPosts());
      setNormalPosts(getMockNormalPosts());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 获取模拟数据的函数
  const getMockTargetedPosts = (): Post[] => [
    {
      id: '1',
      title: '周末麦理浩径组队！',
      content: '本周六（或者周天）有无小伙伴想一起去麦理浩径二段爬山！\n从中大出发自备装备\n大约时长在7-10小时！',
      time: '22:34',
      likeCount: 23,
      saveCount: 3,
      commentCount: 1,
      readTime: '30s',
      energyCount: 1500,
      type: 'targeted',
      isLiked: false,
      isSaved: false,
    },
    {
      id: '2',
      title: 'MATH 201 Final Exam Study Group',
      content: 'Looking for serious study partners for MATH 201 final exam. We will meet every weekend until the exam...',
      time: '18:30',
      likeCount: 15,
      saveCount: 2,
      commentCount: 4,
      readTime: '45s',
      energyCount: 800,
      type: 'targeted',
      isLiked: true, // 已点赞
      isSaved: false,
    },
    {
      id: '3',
      title: 'CS Project Team Formation',
      content: 'Need 2 more members for CS capstone project. Experience with React Native preferred but not required...',
      time: '17:45',
      likeCount: 8,
      saveCount: 1,
      commentCount: 2,
      readTime: '60s',
      energyCount: 600,
      type: 'targeted',
      isLiked: false,
      isSaved: true, // 已收藏
    },
    {
      id: '4',
      title: 'Research Assistant Position',
      content: 'Prof. Smith is looking for undergraduate research assistants for the summer program. Great opportunity for CV...',
      time: '15:15',
      likeCount: 25,
      saveCount: 5,
      commentCount: 8,
      readTime: '90s',
      energyCount: 1200,
      type: 'targeted',
      isLiked: true, // 已点赞
      isSaved: true, // 已收藏
    }
  ];

  const getMockNormalPosts = (): Post[] => [
    {
      id: '5',
      title: 'acct 101 pq sub 求组队',
      content: '如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如...',
      time: '19:04',
      likeCount: 19,
      saveCount: 12,
      commentCount: 43,
      shareCount: 47,
      author: 'Tomas',
      avatar: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/egC8MCMzoa/zwxa4cnk_expires_30_days.png',
      type: 'normal',
      isLiked: false,
      isSaved: false,
    },
    {
      id: '6',
      title: '第九屆「任國榮先生生命科學講座⋯⋯',
      content: '主講：沈祖堯教授\n報名鏈接：https://aaa-bbb.ccc',
      time: '08:00',
      likeCount: 99,
      saveCount: 26,
      commentCount: 26,
      shareCount: 99,
      author: 'cuhk_sls',
      avatar: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/egC8MCMzoa/gxilvdeq_expires_30_days.png',
      type: 'normal',
      isLiked: true, // 已点赞
      isSaved: false,
    },
    {
      id: '7',
      title: '2024-25社會企業起動計劃：接受報名',
      content: 'Social Enterprise Startup Scheme 2024-25: Open\nThe Social Enterprise Startup Scheme...',
      time: '1 days ago',
      likeCount: 99,
      saveCount: 15,
      commentCount: 99,
      shareCount: 99,
      author: 'cuhk_osa_seds',
      avatar: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/egC8MCMzoa/1jtfghtb_expires_30_days.png',
      type: 'normal',
      isLiked: false,
      isSaved: true, // 已收藏
    }
  ];

  // 处理页面刷新
  const onRefresh = () => {
    loadPosts(true);
  };

  // 处理类别切换
  const handleCategorySwitch = (category: 'targeted' | 'normal') => {
    setSelectedCategory(category);
    currentCategoryRef.current = category;
  };

  // 返回处理
  const handleBack = () => {
    router.back();
  };

  // PanResponder 手势处理
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 8;
      },
      onPanResponderGrant: () => {
        translateX.stopAnimation();
        indicatorTranslateX.stopAnimation();
      },
      onPanResponderMove: (evt, gestureState) => {
        const clampedDx = Math.max(-screenWidth * 0.3, Math.min(screenWidth * 0.3, gestureState.dx));
        translateX.setValue(clampedDx);

        const currentIndex = getCategoryIndex(currentCategoryRef.current);
        const basePosition = (screenWidth / 2) * currentIndex;
        const indicatorOffset = -clampedDx / 2;
        const newIndicatorPosition = Math.max(0, Math.min(screenWidth / 2, basePosition + indicatorOffset));
        indicatorTranslateX.setValue(newIndicatorPosition);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const threshold = 30;
        const velocity = gestureState.vx;
        
        const actualCurrentCategory = currentCategoryRef.current;
        const currentIndex = getCategoryIndex(actualCurrentCategory);

        let shouldSwitch = false;
        let newCategory = actualCurrentCategory;
        let newIndex = currentIndex;

        if (Math.abs(gestureState.dx) > threshold || Math.abs(velocity) > 0.2) {
          if (gestureState.dx > 0 || velocity > 0.2) {
            if (currentIndex > 0) {
              newIndex = currentIndex - 1;
              newCategory = getCategoryByIndex(newIndex);
              shouldSwitch = true;
            }
          } else if (gestureState.dx < 0 || velocity < -0.2) {
            if (currentIndex < 1) {
              newIndex = currentIndex + 1;
              newCategory = getCategoryByIndex(newIndex);
              shouldSwitch = true;
            }
          }
        }

        const contentTargetPosition = 0;
        const indicatorTargetPosition = shouldSwitch ? (screenWidth / 2) * newIndex : (screenWidth / 2) * currentIndex;

        Animated.spring(translateX, {
          toValue: contentTargetPosition,
          useNativeDriver: true,
          tension: 150,
          friction: 8,
        }).start();

        Animated.spring(indicatorTranslateX, {
          toValue: indicatorTargetPosition,
          useNativeDriver: true,
          tension: 150,
          friction: 8,
        }).start();

        if (shouldSwitch) {
          setTimeout(() => {
            handleCategorySwitch(newCategory);
          }, 0);
        }
      },
      onPanResponderTerminate: () => {
        const currentIndex = getCategoryIndex(currentCategoryRef.current);
        
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 150,
          friction: 8,
        }).start();

        Animated.spring(indicatorTranslateX, {
          toValue: (screenWidth / 2) * currentIndex,
          useNativeDriver: true,
          tension: 150,
          friction: 8,
        }).start();
      },    })
  ).current;

  // 处理帖子点击
  const handlePostPress = (post: Post) => {
    // Navigate to PostDetail for all post types
    router.push({
      pathname: '/PostDetail',
      params: {
        postId: post.id,
      },
    });
  };

  // 从帖子内容中提取标题的辅助函数
  const extractTitle = (content: string): string => {
    if (!content) return '';
    
    // 取第一行作为标题，移除标签，最多40个字符
    const firstLine = content.split('\n')[0]
      .replace(/#\S+/g, '') // 移除所有标签
      .trim();
      
    if (firstLine.length > 40) {
      return firstLine.substring(0, 40) + '...';
    }
    return firstLine || 'Untitled';
  };

  // 格式化帖子时间
  const formatPostTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) {
        return '1 day ago';
      } else if (diffInDays < 7) {
        return `${diffInDays} days ago`;
      } else {
        // 显示具体时间
        return date.toLocaleDateString();
      }
    }
  };

  // 计算阅读时间
  const calculateReadTime = (content: string): string => {
    const wordsPerMinute = 200; // 平均阅读速度
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    
    if (minutes < 1) {
      return '30s';
    } else if (minutes === 1) {
      return '1 min';
    } else {
      return `${minutes} min`;
    }
  };

  // 计算能量值
  const calculateEnergyCount = (content: string): number => {
    const baseEnergy = 100;
    const contentLength = content.length;
    
    // 根据内容长度计算能量值
    return baseEnergy + Math.floor(contentLength / 10) * 50;
  };

  // 页面加载时获取数据
  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <SafeAreaProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <CommonHeader 
            onBack={handleBack}
            title="发送记录"
            showMore={false}
          />
        </View>

        {/* Categories Container */}
        <View style={styles.categoriesContainer}>
          {/* 动画指示器 */}
          <Animated.View 
            style={[
              styles.animatedIndicator,
              {
                transform: [{ translateX: indicatorTranslateX }]
              }
            ]}
          />
          
          {/* Targeted图标 */}
          <Image
            source={require('../assets/images/energy.png')}
            style={styles.targetedIcon}
          />
          
          {/* Targeted */}
          <TouchableOpacity 
            style={[
              styles.categorySection, 
              selectedCategory === 'targeted' && styles.categoryActive
            ]}
            onPress={() => handleCategorySwitch('targeted')}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === 'targeted' && styles.categoryTextActive
            ]}>
              Targeted
            </Text>
          </TouchableOpacity>

          {/* Normal */}
          <TouchableOpacity 
            style={[
              styles.categorySection, 
              selectedCategory === 'normal' && styles.categoryActive
            ]}
            onPress={() => handleCategorySwitch('normal')}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === 'normal' && styles.categoryTextActive
            ]}>
              Normal
            </Text>
          </TouchableOpacity>
        </View>

        {/* 可滚动内容区域 */}
        <View style={{ flex: 1 }} {...panResponder.panHandlers}>
          <Animated.View 
            style={[
              { flex: 1 },
              { transform: [{ translateX }] }
            ]}
          >
            <ScrollView 
              style={styles.scrollableContent}
              contentContainerStyle={styles.scrollContentContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#4A90E2']}
                  tintColor="#4A90E2"
                />
              }
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
              directionalLockEnabled={true}
            >
              {!loading && (
                <>
                  {selectedCategory === 'targeted' && (
                    <LinearGradient
                      colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']}
                      style={styles.targetedBackground}
                    >
                      {targetedPosts.length > 0 ? (
                        targetedPosts.map((post) => (
                          <TouchableOpacity 
                            key={post.id} 
                            style={styles.targetedCard}
                            onPress={() => handlePostPress(post)}
                          >
                            <View style={styles.targetedCardHeader}>
                              <View style={styles.postHeader}>
                                <Text style={styles.postTitle}>{post.title}</Text>
                                <Text style={styles.postTime}>{post.time}</Text>
                              </View>
                              <Text style={styles.postContent}>{post.content}</Text>
                            </View>
                            <View style={styles.targetedCardFooter}>
                              <View style={styles.postStats}>
                                <View style={styles.likeContainer}>
                                  <Image
                                    source={post.isLiked ? 
                                      require('../assets/images/sumup.png') : 
                                      require('../assets/images/nosumup.png')
                                    }
                                    style={styles.likeIcon}
                                  />
                                  <Text style={styles.likeCount}>{post.likeCount}</Text>
                                </View>
                                <View style={styles.likeContainer}>
                                  <Image
                                    source={post.isSaved ? 
                                      require('../assets/images/save.png') : 
                                      require('../assets/images/nosave.png')
                                    }
                                    style={styles.likeIcon}
                                  />
                                  <Text style={styles.likeCount}>{post.saveCount}</Text>
                                </View>
                                <View style={styles.likeContainer}>
                                  <Image
                                    source={require('../assets/images/comment.png')}
                                    style={styles.likeIcon}
                                  />
                                  <Text style={styles.likeCount}>{post.commentCount}</Text>
                                </View>
                              </View>
                              <View style={styles.rightSection}>
                                <Text style={styles.readTime}>{post.readTime}</Text>
                                <View style={styles.energyBadge}>
                                  <Image
                                    source={require('../assets/images/energy.png')}
                                    style={styles.energyIcon}
                                  />
                                  <Text style={styles.energyCount}>{post.energyCount}</Text>
                                </View>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <View style={styles.emptyContainer}>
                          <Text style={styles.emptyText}>No targeted posts</Text>
                        </View>
                      )}
                    </LinearGradient>
                  )}

                  {selectedCategory === 'normal' && (
                    <LinearGradient
                      colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']}
                      style={styles.normalBackground}
                    >
                      {normalPosts.length > 0 ? (
                        normalPosts.map((post) => (
                          <TouchableOpacity 
                            key={post.id} 
                            style={styles.normalCard}
                            onPress={() => handlePostPress(post)}
                          >
                            <View style={styles.normalCardContent}>
                              <View style={styles.postHeader}>
                                <Text style={styles.normalPostTitle}>{post.title}</Text>
                                <Text style={styles.normalPostTime}>{post.time}</Text>
                              </View>
                              <Text style={styles.normalPostContent}>{post.content}</Text>
                            </View>
                            <View style={styles.normalCardFooter}>
                              <View style={styles.authorInfo}>
                                <Image
                                  source={{uri: post.avatar}}
                                  style={styles.authorAvatar}
                                />
                                <Text style={styles.authorName}>{post.author}</Text>
                              </View>
                              <View style={styles.normalPostStats}>
                                <View style={styles.normalStatItem}>
                                  <Image
                                    source={post.isLiked ? 
                                      require('../assets/images/sumup.png') : 
                                      require('../assets/images/nosumup.png')
                                    }
                                    style={styles.normalStatIcon}
                                  />
                                  <Text style={styles.normalStatText}>{post.likeCount}</Text>
                                </View>
                                <View style={styles.normalStatItem}>
                                  <Image
                                    source={post.isSaved ? 
                                      require('../assets/images/save.png') : 
                                      require('../assets/images/nosave.png')
                                    }
                                    style={styles.normalStatIcon}
                                  />
                                  <Text style={styles.normalStatText}>{post.saveCount}</Text>
                                </View>
                                <View style={styles.normalStatItem}>
                                  <Image
                                    source={require('../assets/images/comment.png')}
                                    style={styles.normalStatIcon}
                                  />
                                  <Text style={styles.normalStatText}>{post.commentCount}</Text>
                                </View>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <View style={styles.emptyContainer}>
                          <Text style={styles.emptyText}>No normal posts</Text>
                        </View>
                      )}
                    </LinearGradient>
                  )}
                </>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
  },
  
  // 分类导航样式
  categoriesContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ACB1C633',
    paddingVertical: 12,
    paddingHorizontal: 27,
    position: 'relative',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.031,
    shadowRadius: 5,
    elevation: 2,
  },
  
  // 动画指示器样式
  animatedIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: screenWidth / 2,
    height: 3,
    backgroundColor: '#0A66C2',
    borderRadius: 1.5,
  },
  
  targetedIcon: {
    width: 20,
    height: 20,
    marginRight: 9,
    tintColor: '#475569',
  },
  
  categorySection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
  },
  
  categoryActive: {
    backgroundColor: 'transparent',
  },
  
  categoryText: {
    color: '#475569',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  categoryTextActive: {
    color: '#0A66C2',
  },

  // 滚动内容样式
  scrollableContent: {
    flex: 1,
  },

  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  // Targeted背景样式
  targetedBackground: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 20,
    minHeight: '100%',
  },

  // Normal背景样式
  normalBackground: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 20,
    minHeight: '100%',
  },

  // Targeted卡片样式
  targetedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    marginHorizontal: 20,
    shadowColor: '#00000021',
    shadowOpacity: 0.051,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 44,
    elevation: 8,
  },

  targetedCardHeader: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },

  targetedCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 15,
  },

  // Normal卡片样式
  normalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    marginHorizontal: 20,
    shadowColor: '#00000021',
    shadowOpacity: 0.051,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 44,
    elevation: 8,
  },

  normalCardContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },

  normalCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    gap: 10,
  },

  // 帖子通用样式
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },

  postTitle: {
    flex: 1,
    color: '#475569',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },

  postTime: {
    color: '#ACB1C6',
    fontSize: 12,
  },

  postContent: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },

  // Normal帖子特定样式
  normalPostTitle: {
    flex: 1,
    color: '#475569',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },

  normalPostTime: {
    color: '#ACB1C6',
    fontSize: 12,
  },

  normalPostContent: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },

  // 点赞、收藏等统计样式 - Targeted
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  likeIcon: {
    width: 16,
    height: 16,
  },

  likeCount: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },

  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  readTime: {
    color: '#64748B',
    fontSize: 11,
  },

  energyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },

  energyIcon: {
    width: 12,
    height: 12,
  },

  energyCount: {
    color: '#0A66C2',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Normal帖子作者信息样式
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },

  authorName: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '500',
  },

  // Normal帖子统计样式
  normalPostStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  normalStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  normalStatIcon: {
    width: 14,
    height: 14,
  },

  normalStatText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },

  // 空状态样式
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },

  emptyText: {
    color: '#64748B',
    fontSize: 16,
    textAlign: 'center',
  },
});