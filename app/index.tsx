import SideDrawer from '@/components/SideDrawer';
import SwipeableRow from '@/components/SwipeableRow';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// 导入 API 函数
import { getImageUrl, getPosts } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 新增：SendButton 组件
function SendButton({ size = 58 }: { size?: number }) {
  const inner = Math.round(size);
  const iconSize = Math.round(inner * 0.48);
  const outerPadding = 6;
  const orangePadding = 4;

  return (
    <View style={[styles.shadowWrapper, { borderRadius: (inner + orangePadding + outerPadding) / 2 }]}>
      <View style={[styles.outerWhite, { padding: outerPadding, borderRadius: (inner + orangePadding + outerPadding) / 2 }]}> 
        <View style={[styles.gradientRing, { padding: orangePadding, borderRadius: (inner + orangePadding) / 2 }]}> 
          <View style={styles.gradientHighlight} pointerEvents="none" />
          <View style={[styles.innerCircle, { width: inner, height: inner, borderRadius: inner / 2 }]}>
            <Image
              source={require('@/assets/images/send_post.png')}
              style={{ width: iconSize, height: iconSize }}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>
    </View>
  );
}

// 帖子数据类型
interface Post {
  postid: string;
  title: string;
  content: string;
  cover_name: string;
  createtime: string;
  tags: string;
  image_url?: string;
  isRead?: boolean;
  isTargeted: boolean;
  readTime: string;
  energy: number;
}

export default function Index() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread' | 'read'>('unread');
  const [userProfile] = useState({
    id: '1',
    username: '校园林克',
    real_name: 'Campus Link User',
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      
      // 获取存储的 token
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        console.warn('No token found, using mock data');
        // 如果没有 token，使用 Mock 数据
        const mockPosts: Post[] = [
          {
            postid: '1',
            title: 'acct 101 pq sub 求组队',
            content: '如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如...',
            cover_name: 'Tomas',
            createtime: '19:04',
            tags: 'ACCT101,Study',
            isRead: false,
            isTargeted: true,
            readTime: '30s',
            energy: 20,
            image_url: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/egC8MCMzoa/yulzzgwh_expires_30_days.png',
          },
          {
            postid: '2',
            title: '第九屆「任國榮先生生命科學講座',
            content: '主講：沈祖堯教授\n報名鏈接：https://aaa-bbb.ccc',
            cover_name: 'cuhk_sls',
            createtime: '08:00',
            tags: 'CUHK,Lecture',
            isRead: true,
            isTargeted: true,
            readTime: '45s',
            energy: 15,
          },
        ];
        setPosts(mockPosts);
        return;
      }

      // 调用真实 API - 只获取 targeted 类型的帖子
      console.log('Fetching posts from API...');
      const response = await getPosts(1, token, 'targeted'); // 使用标签过滤获取定向消息
      
      console.log('API Response:', response);

      if (response.success && response.data?.posts) {
        // 转换 API 数据格式为本地格式
        const transformedPosts: Post[] = response.data.posts.map((post: any) => ({
          postid: post.postid,
          title: post.title,
          content: post.content,
          cover_name: post.cover_name || 'Anonymous',
          createtime: formatDateTime(post.createtime),
          tags: post.tags || '',
          isRead: false, // 默认未读
          isTargeted: true, // 定向消息
          readTime: calculateReadTime(post.content),
          energy: calculateEnergy(post.content),
          image_url: post.image_url ? getImageUrl(post.image_url, token) : undefined,
        }));

        console.log('Transformed posts:', transformedPosts);
        setPosts(transformedPosts);
      } else {
        console.warn('API returned no posts, using fallback');
        Alert.alert('提示', response.message || '暂无定向消息');
        setPosts([]);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
      Alert.alert('错误', '加载帖子失败，请稍后重试');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // 格式化时间
  const formatDateTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // 今天 - 显示时间
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else if (diffDays === 1) {
      return '1 day ago';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      // 超过一周 - 显示日期
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
  };

  // 计算预计阅读时间
  const calculateReadTime = (content: string): string => {
    const wordCount = content.length;
    const readingSpeed = 200; // 每分钟阅读字数
    const minutes = Math.ceil(wordCount / readingSpeed);
    
    if (minutes < 1) {
      return `${Math.ceil((wordCount / readingSpeed) * 60)}s`;
    } else {
      return `${minutes}m`;
    }
  };

  // 计算能量值
  const calculateEnergy = (content: string): number => {
    const wordCount = content.length;
    // 每100字给10能量
    return Math.max(10, Math.floor(wordCount / 100) * 10);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handlePostPress = (post: Post) => {
    setPosts(prevPosts => 
      prevPosts.map(p => 
        p.postid === post.postid 
          ? { ...p, isRead: true }
          : p
      )
    );

    router.push({
      pathname: '/TargetedPostDetail',
      params: {
        postId: post.postid,
        expectedDuration: post.readTime,
      },
    });
  };

  const getFilteredPosts = () => {
    if (selectedTab === 'all') {
      return posts;
    } else if (selectedTab === 'unread') {
      return posts.filter(post => !post.isRead);
    } else if (selectedTab === 'read') {
      return posts.filter(post => post.isRead);
    }
    return posts;
  };

  const getTotalEnergy = () => {
    return posts
      .filter(post => !post.isRead)
      .reduce((total, post) => total + post.energy, 0);
  };

  const getUnreadCount = () => {
    return posts.filter(post => !post.isRead).length;
  };

  const handleDeletePost = (item: Post) => {
    Alert.alert(
      '确认删除',
      `确定要删除 "${item.title}" 吗？`,
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive',
          onPress: () => {
            setPosts(posts.filter(post => post.postid !== item.postid));
          }
        }
      ]
    );
  };

  const handleBookmarkPost = (item: Post) => {
    Alert.alert(
      '成功',
      '已添加到收藏',
      [{ text: '确定' }]
    );
  };

  const renderPost = ({ item }: { item: Post }) => (
    <SwipeableRow
      item={item}
      onDelete={handleDeletePost}
      onBookmark={handleBookmarkPost}
    >
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => handlePostPress(item)}
        activeOpacity={0.9}
      >
        {/* 卡片上部分：标题和内容 */}
        <View style={{ marginBottom: 12 }}>
          {/* 标题栏 */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.cardTime}>{item.createtime}</Text>
          </View>

          {/* 内容主体 */}
          <View style={styles.cardBody}>
            <Text style={styles.cardContent} numberOfLines={3}>
              {item.content}
            </Text>
            {item.image_url && (
              <Image
                source={{ uri: item.image_url }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            )}
          </View>
        </View>

        {/* 卡片下部分：用户信息与能量 */}
        <View style={styles.cardFooter}>
          <View style={styles.userInfo}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{item.cover_name[0]}</Text>
            </View>
            <Text style={styles.username}>{item.cover_name}</Text>
          </View>

          <View style={styles.actions}>
            <Text style={styles.elapsedTime}>{item.readTime}</Text>
            <View style={styles.pointsBtn}>
              <Image
                source={require('@/assets/images/energy.png')}
                style={styles.energyIconSmall}
              />
              <Text style={styles.pointsText}>+{item.energy}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </SwipeableRow>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFC107" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <SideDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          userProfile={userProfile}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.profileIconButton}
            onPress={() => setDrawerOpen(true)}
          >
            <Image
              source={require('@/assets/images/navigation.png')}
              style={styles.navigationIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>主页</Text>
            {getUnreadCount() > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{getUnreadCount()}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.totalEnergyContainer}>
            <Image
              source={require('@/assets/images/energy.png')}
              style={styles.totalEnergyIcon}
            />
            <Text style={styles.totalEnergyText}>{getTotalEnergy()}</Text>
          </View>
        </View>

        {/* Posts List */}
        <FlatList
          data={getFilteredPosts()}
          renderItem={renderPost}
          keyExtractor={(item) => item.postid}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />

        {/* 底部悬浮栏 */}
        <View style={styles.bottomBar}>
          {/* 左侧切换按钮 */}
          <View style={styles.filterPill}>
            {(['all', 'unread', 'read'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.filterItem,
                  selectedTab === tab && styles.filterItemSelected
                ]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text style={[
                  styles.filterTextGray,
                  selectedTab === tab && styles.filterTextSelected
                ]}>
                  {tab === 'all' ? '所有' : tab === 'unread' ? '未读' : '已读'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 右侧发送按钮 */}
          <TouchableOpacity 
            style={styles.fabButton}
            onPress={() => router.push('/post')}
            activeOpacity={0.8}
          >
            <SendButton size={50} />
          </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 70,
    backgroundColor: '#FFFFFF',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  badge: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    marginLeft: 4,
    position: 'absolute',
    top: -8,
    right: -20,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  totalEnergyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC107',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  totalEnergyIcon: {
    width: 12,
    height: 12,
    marginRight: 2,
  },
  totalEnergyText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  profileIconButton: {
    padding: 4,
  },
  navigationIcon: {
    width: 28,
    height: 28,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 100,
  },
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
  bottomBar: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  filterPill: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 25,
    padding: 4,
    alignItems: 'center',
  },
  filterItem: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  filterItemSelected: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  filterTextGray: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  filterTextSelected: {
    color: '#333',
    fontWeight: 'bold',
  },
  fabButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadowWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  outerWhite: {
    backgroundColor: '#FFFFFF',
  },
  gradientRing: {
    backgroundColor: '#FF9317',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gradientHighlight: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFCC00',
    top: 2,
    left: 6,
    opacity: 0.95,
  },
  innerCircle: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
