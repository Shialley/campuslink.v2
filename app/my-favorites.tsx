import AsyncStorage from '@react-native-async-storage/async-storage';
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

import CommonHeader from '../components/CommonHeader';

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
    {
      id: '1',
      title: 'acct 101 pq sub 求组队',
      content: '如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如...',
      time: '19:04',
      author: 'Tomas',
      readTime: '30s',
      energy: 20,
      isSaved: true,
      image_url: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/egC8MCMzoa/yulzzgwh_expires_30_days.png',
    },
    {
      id: '2',
      title: '第九屆「任國榮先生生命科學講座',
      content: '主講：沈祖堯教授\n報名鏈接：https://aaa-bbb.ccc',
      time: '08:00',
      author: 'cuhk_sls',
      avatar: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/egC8MCMzoa/gxilvdeq_expires_30_days.png',
      readTime: '45s',
      energy: 15,
      isSaved: true,
    },
    {
      id: '3',
      title: '2024-25社會企業起動計劃：接受報名',
      content: 'Social Enterprise Startup Scheme 2024-25: Open. The Social Enterprise Startup Scheme...',
      time: '1 days ago',
      author: 'cuhk_osa_seds',
      avatar: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/egC8MCMzoa/1jtfghtb_expires_30_days.png',
      readTime: '2m',
      energy: 25,
      isSaved: true,
    },
    {
      id: '4',
      title: 'Elite Internship Program 2025',
      content: 'Program Period : Mid June - 31 August 2025',
      time: '2025/04/07',
      author: 'career_center',
      readTime: '1m',
      energy: 18,
      isSaved: true,
    },
    {
      id: '5',
      title: 'CS Project Team Formation',
      content: 'Need 2 more members for CS capstone project. Experience with React Native preferred but not required...',
      time: '17:45',
      author: 'Bob',
      avatar: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/fa02901a-ef57-4acd-8802-9136a32e9512',
      readTime: '60s',
      energy: 30,
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
    router.push({
      pathname: '/TargetedPostDetail',
      params: {
        postId: post.id,
        expectedDuration: post.readTime,
      },
    });
  };

  // 页面加载时获取数据
  useEffect(() => {
    loadFavoritePosts();
  }, []);

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
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFC107" />
            </View>
          ) : favoritePosts.length > 0 ? (
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
                          <Text style={styles.avatarText}>{post.author[0]}</Text>
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
  },
});