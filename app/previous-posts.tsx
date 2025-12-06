import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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

// 帖子数据类型
interface Post {
  id: string;
  title: string;
  content: string;
  time: string;
  author: string;
  avatar?: string;
  readTime: string;
  energy: number;
  image_url?: string;
  energyUsed: number;
  energyTotal: number;
  isFinished: boolean;
  viewCount?: number;
  targetViewCount?: number;
}

export default function PreviousPostsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  // 加载帖子数据
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
          
          let postsList: any[] = [];
          
          if (Array.isArray(userPostsResult)) {
            postsList = userPostsResult;
          } else if (userPostsResult && typeof userPostsResult === 'object') {
            if (userPostsResult.success) {
              const raw = userPostsResult.data;
              postsList = Array.isArray(raw) ? raw : (raw?.posts ?? raw?.data ?? []);
            }
          }
          
          console.log('Extracted posts list:', postsList.length, 'posts');
          
          if (postsList.length > 0) {
            const postsData: Post[] = postsList.map((post: any) => {
              const energy = calculateEnergyCount(post.content || '');
              const viewCount = post.viewCount || Math.floor(Math.random() * 100);
              const targetViewCount = post.targetViewCount || 100;
              const energyUsed = Math.floor((viewCount / targetViewCount) * energy);
              
              return {
                id: post.postid || post.id,
                title: extractTitle(post.content) || 'Untitled',
                content: post.content || '',
                time: formatPostTime(post.createtime || new Date().toISOString()),
                author: post.cover_name || 'Anonymous',
                readTime: calculateReadTime(post.content || ''),
                energy: energy,
                energyUsed: energyUsed,
                energyTotal: energy,
                isFinished: viewCount >= targetViewCount,
                viewCount: viewCount,
                targetViewCount: targetViewCount,
                image_url: post.image_url,
              };
            });
            
            setPosts(postsData);
          } else {
            console.log('No posts found, using mock data');
            setPosts(getMockPosts());
          }
          
        } catch (apiError) {
          console.log('Posts API error, using mock data:', apiError);
          setPosts(getMockPosts());
        }
      } else {
        console.log('No token, using mock data');
        setPosts(getMockPosts());
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts(getMockPosts());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 获取模拟数据
  const getMockPosts = (): Post[] => [
    {
      id: '1',
      title: 'acct 101 pq sub 求组队',
      content: '如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如...',
      time: '19:04',
      author: 'You',
      readTime: '30s',
      energy: 800,
      energyUsed: 420,
      energyTotal: 800,
      isFinished: false,
      viewCount: 52,
      targetViewCount: 100,
      image_url: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/egC8MCMzoa/yulzzgwh_expires_30_days.png',
    },
    {
      id: '2',
      title: '第九屆「任國榮先生生命科學講座',
      content: '主講：沈祖堯教授\n報名鏈接：https://aaa-bbb.ccc',
      time: '08:00',
      author: 'You',
      readTime: '45s',
      energy: 1100,
      energyUsed: 1100,
      energyTotal: 1100,
      isFinished: true,
      viewCount: 100,
      targetViewCount: 100,
    },
    {
      id: '3',
      title: 'MATH 201 Final Exam Study Group',
      content: 'Looking for serious study partners for MATH 201 final exam. We will meet every weekend until the exam...',
      time: '18:30',
      author: 'You',
      readTime: '45s',
      energy: 600,
      energyUsed: 480,
      energyTotal: 600,
      isFinished: false,
      viewCount: 80,
      targetViewCount: 100,
    },
  ];

  // 从帖子内容中提取标题
  const extractTitle = (content: string): string => {
    if (!content) return '';
    
    const firstLine = content.split('\n')[0]
      .replace(/#\S+/g, '')
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
        return date.toLocaleDateString();
      }
    }
  };

  // 计算阅读时间
  const calculateReadTime = (content: string): string => {
    const wordsPerMinute = 200;
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
    return baseEnergy + Math.floor(contentLength / 10) * 50;
  };

  // 格式化能量数字
  const formatEnergyNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // 处理页面刷新
  const onRefresh = () => {
    loadPosts(true);
  };

  // 返回处理
  const handleBack = () => {
    router.back();
  };

  // 处理帖子点击
  const handlePostPress = (post: Post) => {
    router.push({
      pathname: '/PostDetail',
      params: {
        postId: post.id,
      },
    });
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

        {/* 可滚动内容区域 */}
        <ScrollView 
          style={styles.scrollableContent}
          contentContainerStyle={styles.scrollContentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FFC107']}
              tintColor="#FFC107"
            />
          }
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFC107" />
            </View>
          ) : posts.length > 0 ? (
            <>
              {posts.map((post) => (
                <TouchableOpacity 
                  key={post.id} 
                  style={styles.cardContainer}
                  onPress={() => handlePostPress(post)}
                  activeOpacity={0.9}
                >
                  {/* 卡片上部分：标题和内容 */}
                  <View style={{ marginBottom: 10 }}>
                    {/* 标题栏 */}
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {post.title}
                      </Text>
                      <Text style={styles.cardTime}>{post.time}</Text>
                    </View>

                    {/* 内容主体 */}
                    <View style={styles.cardBody}>
                      <Text style={styles.cardContent} numberOfLines={3}>
                        {post.content}
                      </Text>
                      {post.image_url && (
                        <Image
                          source={{ uri: post.image_url }}
                          style={styles.cardImage}
                          resizeMode="cover"
                        />
                      )}
                    </View>
                  </View>

                  {/* 进度条区域 */}
                  {post.isFinished ? (
                    // 已完成状态
                    <>
                      <View style={styles.divider} />
                      <View style={styles.finishedContainer}>
                        <View style={styles.finishedBadge}>
                          <Text style={styles.finishedText}>Finished</Text>
                        </View>
                        <View style={styles.energyDisplayRow}>
                          <Image
                            source={require('../assets/images/energy.png')}
                            style={styles.energyIconSmallGray}
                          />
                          <Text style={styles.energyTextGray}>
                            {formatEnergyNumber(post.energyUsed)} / {formatEnergyNumber(post.energyTotal)}
                          </Text>
                        </View>
                      </View>
                    </>
                  ) : (
                    // 进行中状态
                    <View style={styles.progressContainer}>
                      {/* 进度条背景 */}
                      <View style={styles.progressBarBackground}>
                        <LinearGradient
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          colors={['#FF9317', '#FFCC00']}
                          style={[
                            styles.progressBarFill,
                            { width: `${(post.energyUsed / post.energyTotal) * 100}%` }
                          ]}
                        />
                      </View>
                      
                      {/* 能量显示 */}
                      <View style={styles.energyDisplayRow}>
                        <Image
                          source={require('../assets/images/energy.png')}
                          style={styles.energyIconSmallOrange}
                        />
                        <Text style={styles.energyTextOrange}>
                          {formatEnergyNumber(post.energyUsed)} / {formatEnergyNumber(post.energyTotal)}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Image
                source={require('../assets/images/energy.png')}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>No Posts Yet</Text>
              <Text style={styles.emptyText}>Start posting to see them here</Text>
            </View>
          )}
        </ScrollView>
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
  
  // 滚动内容样式
  scrollableContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },

  // 卡片样式
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#ACB1C633',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  cardTitle: {
    color: '#475569',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },

  cardTime: {
    color: '#ACB1C6',
    fontSize: 12,
    marginTop: 2,
  },

  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cardContent: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    marginRight: 10,
  },

  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },

  // 进度条样式
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 5,
  },

  progressBarBackground: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 15,
    marginRight: 15,
    height: 10,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: 10,
    borderRadius: 15,
  },

  energyDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  energyIconSmallOrange: {
    width: 12,
    height: 12,
    marginRight: 4,
    tintColor: '#FF9317',
  },

  energyTextOrange: {
    color: '#FF9317',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // 已完成状态样式
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },

  finishedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  finishedBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },

  finishedText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
  },

  energyIconSmallGray: {
    width: 12,
    height: 12,
    marginRight: 4,
    tintColor: '#94A3B8',
  },

  energyTextGray: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: 'bold',
  },

  // 空状态样式
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    marginBottom: 24,
    tintColor: '#CBD5E1',
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
});