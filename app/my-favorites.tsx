import AsyncStorage from '@react-native-async-storage/async-storage';
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

import CommonHeader from '../components/CommonHeader';
import { getSaves } from '../services/api';
import { getImageDisplayUrl } from '../utils/imageUtils';

// 帖子数据类型
interface FavoritePost {
  id: string;
  title: string;
  content: string;
  time: string;
  author: string;
  avatar?: string;
  readTime: string;
  energy: number;
  image_url?: string;
  isSaved: true;
}

export default function MyFavoritesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favoritePosts, setFavoritePosts] = useState<FavoritePost[]>([]);

  useEffect(() => {
    loadFavoritePosts();
  }, []);

  // 加载收藏的帖子数据
  const loadFavoritePosts = async (isRefresh: boolean = false) => {
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

      console.log('📡 Loading favorite posts from API...');
      const result = await getSaves(token);
      
      console.log('✅ getSaves result:', result);
      
      if (result.success && result.data?.saves) {
        // 转换 API 数据格式
        const posts: FavoritePost[] = result.data.saves.map((save: any) => {
          // save 可能包含完整的 post 对象或只是 post_id
          const post = save.post || save;
          const content = post.content || '';
          
          return {
            id: post.postid || post.post_id || save.post_id,
            title: extractTitle(content, post.title),
            content: content,
            time: formatPostTime(post.createtime || save.created_at || new Date().toISOString()),
            author: post.cover_name || post.author || 'Anonymous',
            avatar: post.avatar,
            readTime: calculateReadTime(content),
            energy: calculateEnergy(content),
            image_url: post.image_url ? getImageDisplayUrl(post.image_url) : undefined,
            isSaved: true,
          };
        });
        
        setFavoritePosts(posts);
        console.log('✅ Favorite posts loaded successfully:', posts.length);
      } else {
        console.warn('⚠️ No favorite posts found');
        setFavoritePosts([]);
      }
    } catch (error) {
      console.error('❌ Error loading favorite posts:', error);
      Alert.alert('错误', '加载收藏失败');
      setFavoritePosts([]);
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
        } else {
          return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
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
      return '1m';
    } else {
      return `${minutes}m`;
    }
  };

  // 计算能量值
  const calculateEnergy = (content: string): number => {
    if (!content) return 20;
    
    const baseEnergy = 10;
    const contentLength = content.length;
    // 每100个字符增加10能量
    return baseEnergy + Math.floor(contentLength / 100) * 10;
  };

  // 处理页面刷新
  const onRefresh = () => {
    loadFavoritePosts(true);
  };

  // 返回处理
  const handleBack = () => {
    router.back();
  };

  // 处理帖子点击
  const handlePostPress = (post: FavoritePost) => {
    router.push({
      pathname: '/TargetedPostDetail',
      params: {
        postId: post.id,
        expectedDuration: post.readTime,
      },
    });
  };

  // 加载中状态
  if (loading) {
    return (
      <SafeAreaProvider>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container} edges={['top']}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <CommonHeader 
              onBack={handleBack}
              title="My Favorites"
              showMore={false}
            />
          </View>

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFC107" />
            <Text style={styles.loadingText}>Loading favorites...</Text>
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
            title="My Favorites"
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
          {favoritePosts.length > 0 ? (
            <>
              {favoritePosts.map((post) => (
                <TouchableOpacity 
                  key={post.id} 
                  style={styles.cardContainer}
                  onPress={() => handlePostPress(post)}
                  activeOpacity={0.9}
                >
                  {/* 卡片上部分：标题和内容 */}
                  <View style={{ marginBottom: 12 }}>
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

                  {/* 卡片下部分：用户信息与能量 */}
                  <View style={styles.cardFooter}>
                    <View style={styles.userInfo}>
                      {post.avatar ? (
                        <Image
                          source={{ uri: post.avatar }}
                          style={styles.authorAvatar}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.avatarText}>
                            {post.author[0]?.toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.username}>{post.author}</Text>
                    </View>

                    <View style={styles.actions}>
                      <Text style={styles.elapsedTime}>{post.readTime}</Text>
                      <View style={styles.pointsBtn}>
                        <Image
                          source={require('../assets/images/energy.png')}
                          style={styles.energyIconSmall}
                        />
                        <Text style={styles.pointsText}>+{post.energy}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Image
                source={require('../assets/images/save.png')}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>No Favorites Yet</Text>
              <Text style={styles.emptyText}>Start saving posts to see them here</Text>
              <TouchableOpacity 
                style={styles.exploreButton}
                onPress={() => router.push('/')}
              >
                <Text style={styles.exploreButtonText}>Explore Posts</Text>
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

  // 卡片样式 - 与 index.tsx 完全一致
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  cardTitle: {
    color: '#334155',
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },

  cardTime: {
    color: '#94A3B8',
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
    borderRadius: 8,
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: '#eee',
  },

  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  username: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  elapsedTime: {
    color: '#94A3B8',
    fontSize: 12,
    marginRight: 10,
  },

  pointsBtn: {
    flexDirection: 'row',
    backgroundColor: '#FFC107',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
  },

  energyIconSmall: {
    width: 12,
    height: 12,
    marginRight: 2,
  },

  pointsText: {
    color: '#333',
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

  exploreButton: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },

  exploreButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
});