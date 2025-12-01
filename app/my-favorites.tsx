import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
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

// 帖子数据类型
interface FavoritePost {
  id: string;
  title: string;
  content: string;
  time: string;
  likeCount: number;
  commentCount?: number;
  shareCount?: number;
  saveCount?: number;
  author?: string;
  avatar?: string;
  readTime?: string;
  energyCount?: number;
  type: 'targeted' | 'normal';
  isLiked?: boolean;
  isSaved: true; // 收藏夹中的帖子都是已收藏的
}

export default function MyFavoritesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [favoritePosts, setFavoritePosts] = useState<FavoritePost[]>([]);

  // 加载收藏的帖子数据
  const loadFavoritePosts = async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = await AsyncStorage.getItem('userToken');
      
      if (token) {
        try {
          // 这里应该调用实际的API获取用户收藏的帖子
          // const favoritesResult = await getUserFavorites(token);
          
          // 暂时使用模拟数据
          console.log('Loading favorite posts... (using mock data)');
          setFavoritePosts(getMockFavoritePosts());
          
        } catch (apiError) {
          console.log('Favorites API error, using mock data:', apiError);
          setFavoritePosts(getMockFavoritePosts());
        }
      } else {
        console.log('No token, using mock data');
        setFavoritePosts(getMockFavoritePosts());
      }
    } catch (error) {
      console.error('Error loading favorite posts:', error);
      setFavoritePosts(getMockFavoritePosts());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 获取模拟收藏数据
  const getMockFavoritePosts = (): FavoritePost[] => [
    // Normal类型的收藏帖子
    {
      id: '1',
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
      isLiked: true,
      isSaved: true,
    },
    {
      id: '2',
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
      isSaved: true,
    },
    // Targeted类型的收藏帖子
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
      isSaved: true,
      author: 'Bob',
      avatar: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/fa02901a-ef57-4acd-8802-9136a32e9512',
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
      isLiked: true,
      isSaved: true,
      author: 'David',
      avatar: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/983f751b-ba61-4649-9393-f976791de825',
    },
    {
      id: '5',
      title: 'Campus Event Photography',
      content: 'Looking for someone to help with photography for upcoming campus events. Equipment provided, some experience preferred...',
      time: '14:00',
      likeCount: 12,
      saveCount: 3,
      commentCount: 5,
      readTime: '40s',
      energyCount: 400,
      type: 'targeted',
      isLiked: false,
      isSaved: true,
      author: 'Emma',
      avatar: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/fa02901a-ef57-4acd-8802-9136a32e9512',
    },
    {
      id: '6',
      title: 'Free Study Materials for ECON',
      content: 'I have compiled comprehensive study notes and practice problems for ECON 101-201. Free for anyone who needs them...',
      time: '2 days ago',
      likeCount: 45,
      saveCount: 12,
      commentCount: 15,
      shareCount: 30,
      author: 'StudyHelper',
      avatar: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/egC8MCMzoa/zwxa4cnk_expires_30_days.png',
      type: 'normal',
      isLiked: true,
      isSaved: true,
    },
  ];

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
    // Navigate to PostDetail for all post types
    router.push({
      pathname: '/PostDetail',
      params: {
        postId: post.id,
      },
    });
  };

  // 页面加载时获取数据
  useEffect(() => {
    loadFavoritePosts();
  }, []);

  // 分离Normal和Targeted帖子
  const normalPosts = favoritePosts.filter(post => post.type === 'normal');
  const targetedPosts = favoritePosts.filter(post => post.type === 'targeted');

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
              colors={['#4A90E2']}
              tintColor="#4A90E2"
            />
          }
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']}
            style={styles.contentBackground}
          >
            {!loading && (
              <>
                {favoritePosts.length > 0 ? (
                  <>
                    {/* Normal帖子部分 */}
                    {normalPosts.map((post) => (
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
                                source={require('../assets/images/save.png')}
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
                    ))}

                    {/* Targeted帖子部分 */}
                    {targetedPosts.map((post) => (
                      <TouchableOpacity 
                        key={post.id} 
                        style={styles.targetedCard}
                        onPress={() => handlePostPress(post)}
                      >
                        <View style={styles.targetedCardHeader}>
                          <View style={styles.targetedMessageHeader}>
                            <Text style={styles.targetedMessageTitle}>{post.title}</Text>
                            <Text style={styles.targetedMessageTime}>{post.time}</Text>
                          </View>
                          <Text style={styles.targetedMessageContent}>{post.content}</Text>
                        </View>
                        <View style={styles.targetedCardFooter}>
                          <View style={styles.targetedAuthorInfo}>
                            <Image
                              source={{uri: post.avatar}}
                              resizeMode="stretch"
                              style={styles.targetedAuthorAvatar}
                            />
                            <Text style={styles.targetedAuthorName}>{post.author}</Text>
                          </View>
                          <View style={styles.targetedActionArea}>
                            {post.readTime && (
                              <Text style={styles.readTime}>{post.readTime}</Text>
                            )}
                            {post.energyCount && (
                              <View style={styles.readTimeBadge}>
                                <Image
                                  source={require('../assets/images/energy.png')}
                                  style={styles.readTimeBadgeIcon}
                                />
                                <Text style={styles.readTimeBadgeText}>{post.energyCount}</Text>
                              </View>
                            )}
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
                  </View>
                )}
              </>
            )}
          </LinearGradient>
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
  },

  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  // 内容背景样式
  contentBackground: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 20,
    minHeight: '100%',
  },

  // Normal卡片样式 - 复用 previous-posts 的样式
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

  // Targeted卡片样式 - 复用 messages 的样式
  targetedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 20,
    shadowColor: '#0000001A',
    shadowOpacity: 0.15,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  targetedCardHeader: {
    borderColor: '#E2E8F0',
    borderBottomWidth: 1,
    marginBottom: 15,
    marginHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },

  targetedMessageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  targetedMessageTitle: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 4,
    flex: 1,
    lineHeight: 20,
  },

  targetedMessageTime: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'right',
  },

  targetedMessageContent: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
  },

  targetedCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 5,
    paddingBottom: 20,
  },

  targetedAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  targetedAuthorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },

  targetedAuthorName: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },

  targetedActionArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  // 帖子通用样式
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },

  // Normal帖子特定样式
  normalPostTitle: {
    flex: 1,
    color: '#475569',
    fontSize: 14,
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
  },

  // 作者信息
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 0,
    minWidth: 120,
  },

  authorAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },

  authorName: {
    color: '#475569',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Normal帖子统计
  normalPostStats: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    gap: 10,
  },

  normalStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  normalStatIcon: {
    width: 16,
    height: 16,
  },

  normalStatText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: 'normal',
  },

  // Targeted帖子相关样式
  readTime: {
    color: '#94A3B8',
    fontSize: 12,
    marginRight: 12,
  },

  readTimeBadge: {
    backgroundColor: '#FF8C00',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    width: 65,
    height: 32,
    shadowColor: '#FF8C00',
    shadowOpacity: 0.3,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
    elevation: 4,
  },

  readTimeBadgeIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },

  readTimeBadgeText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
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