import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  // 页面加载时获取数据
  useEffect(() => {
    loadPosts();
  }, []);

  // 加载帖子数据
  const loadPosts = async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        console.warn('⚠️ No token found, redirecting to login');
        router.push('/login');
        return;
      }

      console.log('📡 Loading user posts from API...');
      const result = await getUserPosts(1, token);
      
      console.log('✅ getUserPosts result:', result);
      
      if (result.success && result.data?.posts) {
        const apiPosts = result.data.posts;
        console.log('✅ Found', apiPosts.length, 'posts');
        
        // 转换 API 数据格式
        const postsData: Post[] = apiPosts.map((post: any) => {
          const content = post.content || '';
          const energy = calculateEnergyCount(content);
          const viewCount = post.view_count || post.viewCount || Math.floor(Math.random() * 100);
          const targetViewCount = post.target_view_count || post.targetViewCount || 100;
          const energyUsed = Math.floor((viewCount / targetViewCount) * energy);
          
          return {
            id: post.postid || post.id,
            title: extractTitle(content, post.title),
            content: content,
            time: formatPostTime(post.createtime || new Date().toISOString()),
            author: post.cover_name || 'You',
            readTime: calculateReadTime(content),
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
        console.log('✅ User posts loaded successfully:', postsData.length);
      } else {
        console.warn('⚠️ No posts found or API failed:', result.message);
        setPosts([]);
      }
    } catch (error) {
      console.error('❌ Error loading posts:', error);
      Alert.alert('错误', '加载帖子失败');
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 从帖子内容中提取标题
  const extractTitle = (content: string, apiTitle?: string): string => {
    // 如果 API 返回了标题，优先使用
    if (apiTitle && apiTitle.trim()) {
      return apiTitle.length > 40 ? apiTitle.substring(0, 40) + '...' : apiTitle;
    }
    
    // 否则从内容中提取
    if (!content) return 'Untitled';
    
    // 移除 hashtags 并获取第一行
    const firstLine = content
      .split('\n')[0]
      .replace(/#\S+/g, '')
      .trim();
      
    if (firstLine.length > 40) {
      return firstLine.substring(0, 40) + '...';
    }
    return firstLine || 'Untitled';
  };

  // 格式化帖子时间
  const formatPostTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffInHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffMs / (1000 * 60));
        if (diffInMinutes < 1) return 'Just now';
        return `${diffInMinutes}min ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) {
          return '1 day ago';
        } else if (diffInDays < 7) {
          return `${diffInDays} days ago`;
        } else if (diffInDays < 30) {
          const weeks = Math.floor(diffInDays / 7);
          return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        } else {
          return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
          });
        }
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return timestamp;
    }
  };

  // 计算阅读时间
  const calculateReadTime = (content: string): string => {
    if (!content) return '30s';
    
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    
    if (minutes < 1) {
      const seconds = Math.ceil((words / wordsPerMinute) * 60);
      return `${Math.max(30, seconds)}s`;
    } else if (minutes === 1) {
      return '1 min';
    } else {
      return `${minutes} min`;
    }
  };

  // 计算能量值
  const calculateEnergyCount = (content: string): number => {
    if (!content) return 100;
    
    const baseEnergy = 100;
    const contentLength = content.length;
    // 每50个字符增加50能量
    return baseEnergy + Math.floor(contentLength / 50) * 50;
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

  // 渲染加载状态
  if (loading) {
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

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFC107" />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

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
          {posts.length > 0 ? (
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
                            { width: `${Math.min(100, (post.energyUsed / post.energyTotal) * 100)}%` }
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
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => router.push('/post')}
              >
                <Text style={styles.createButtonText}>Create Post</Text>
              </TouchableOpacity>
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

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748B',
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
    marginBottom: 24,
  },

  createButton: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },

  createButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
});