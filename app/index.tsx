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

// Filter图标组件 - 使用 emoji
const FilterIcon = () => (
  <Text style={{ fontSize: 20 }}>🔍</Text>
);

// 点赞图标
const LikeIcon = ({ filled = false }: { filled?: boolean }) => (
  <Image
    source={filled ? require('@/assets/images/sumup.png') : require('@/assets/images/nosumup.png')}
    style={styles.iconImage}
  />
);

// 收藏图标
const BookmarkIcon = ({ filled = false }: { filled?: boolean }) => (
  <Image
    source={filled ? require('@/assets/images/save.png') : require('@/assets/images/nosave.png')}
    style={styles.iconImage}
  />
);

// 评论图标
const CommentIcon = () => (
  <Image
    source={require('@/assets/images/comment.png')}
    style={styles.iconImage}
  />
);

// 新增：SendButton 组件
function PaperPlaneFallback({ size = 28 }: { size?: number }) {
  const wingStyle = {
    width: size * 0.9,
    height: size * 0.22,
    borderRadius: 2,
    backgroundColor: '#2B2F36',
  };

  const bodyStyle = {
    width: size * 0.5,
    height: size * 0.22,
    borderRadius: 2,
    backgroundColor: '#2B2F36',
  };

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={[wingStyle, { transform: [{ rotate: '-20deg' }, { translateY: -2 }] }]} />
      <View style={[bodyStyle, { position: 'absolute', transform: [{ rotate: '30deg' }] }]} />
    </View>
  );
}

function SendButton({ iconSource, size = 58 }: { iconSource?: any; size?: number }) {
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

// 帖子数据类型 - 添加 isRead 和 isTargeted 字段
interface Post {
  postid: string;
  title: string;
  content: string;
  cover_name: string;
  createtime: string;
  like: number;
  comments: number;
  bookmarks: number;
  tags: string;
  image_url?: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isRead?: boolean; // 新增：是否已读
  isTargeted?: boolean; // 新增：是否为 targeted post
  readTime?: string; // 新增：期待阅读时长
  energy?: number; // 新增：能量值
}

export default function Index() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread' | 'read'>('all'); // 新增：当前选中的 tab
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
      // 模拟数据加载 - 添加 targeted posts
      const mockPosts: Post[] = [
        {
          postid: '1',
          title: 'acct 101 pq sub 求组队',
          content: '如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如...',
          cover_name: 'Tomas',
          createtime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          like: 10,
          comments: 5,
          bookmarks: 3,
          tags: 'ACCT101,Study',
          isLiked: false,
          isBookmarked: false,
          isRead: false, // 未读
          isTargeted: true, // 是 targeted post
          readTime: '30s',
          energy: 20,
        },
        {
          postid: '2',
          title: '第九屆「任國榮先生生命科學講座',
          content: '主講：沈祖堯教授\n報名鏈接：https://aaa-bbb.ccc',
          cover_name: 'cuhk_sls',
          createtime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          like: 45,
          comments: 12,
          bookmarks: 18,
          tags: 'CUHK,Lecture',
          isLiked: false,
          isBookmarked: false,
          isRead: true, // 已读
          isTargeted: true,
          readTime: '45s',
          energy: 15,
        },
        {
          postid: '3',
          title: 'Welcome to CampusLink',
          content: 'This is the main feed where you can see all posts from your campus community.',
          cover_name: 'Admin',
          createtime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          like: 100,
          comments: 25,
          bookmarks: 50,
          tags: 'Welcome,Info',
          isLiked: false,
          isBookmarked: false,
          isRead: false, // 未读
          isTargeted: false, // 普通帖子
        },
        {
          postid: '4',
          title: '2024-25社會企業起動計劃：接受報名',
          content: 'Social Enterprise Startup Scheme 2024-25: Open. The Social Enterprise Startup Scheme...',
          cover_name: 'cuhk_osa_seds',
          createtime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          like: 30,
          comments: 8,
          bookmarks: 12,
          tags: 'CUHK,SocialEnterprise',
          isLiked: false,
          isBookmarked: false,
          isRead: true, // 已读
          isTargeted: true,
          readTime: '2m',
          energy: 25,
        },
      ];
      setPosts(mockPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
      Alert.alert('Error', 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.postid === postId 
        ? { ...post, isLiked: !post.isLiked, like: post.isLiked ? post.like - 1 : post.like + 1 }
        : post
    ));
  };

  const handleBookmark = (postId: string) => {
    setPosts(posts.map(post => 
      post.postid === postId 
        ? { ...post, isBookmarked: !post.isBookmarked, bookmarks: post.isBookmarked ? post.bookmarks - 1 : post.bookmarks + 1 }
        : post
    ));
  };

  // 新增：处理帖子点击 - 区分普通帖子和 targeted post
  const handlePostPress = (post: Post) => {
    // 标记为已读
    setPosts(prevPosts => 
      prevPosts.map(p => 
        p.postid === post.postid 
          ? { ...p, isRead: true }
          : p
      )
    );

    if (post.isTargeted) {
      // 跳转到 TargetedPostDetail
      router.push({
        pathname: '/TargetedPostDetail',
        params: {
          postId: post.postid,
          expectedDuration: post.readTime || '30s',
        },
      });
    } else {
      // 跳转到普通 PostDetail
      router.push(`/PostDetail?postid=${post.postid}`);
    }
  };

  // 新增：根据 tab 过滤帖子
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

  // 新增：计算总能量
  const getTotalEnergy = () => {
    return posts
      .filter(post => post.isTargeted && post.energy)
      .reduce((total, post) => total + (post.energy || 0), 0);
  };

  // 新增：删除帖子
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

  // 新增：收藏/取消收藏帖子
  const handleBookmarkPost = (item: Post) => {
    setPosts(posts.map(post => 
      post.postid === item.postid 
        ? { 
            ...post, 
            isBookmarked: !post.isBookmarked, 
            bookmarks: post.isBookmarked ? post.bookmarks - 1 : post.bookmarks + 1 
          }
        : post
    ));
    
    // 显示提示
    Alert.alert(
      '成功',
      item.isBookmarked ? '已取消收藏' : '已添加到收藏',
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
        style={styles.postCardContent}
        onPress={() => handlePostPress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.postHeader}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{item.cover_name[0]}</Text>
          </View>
          <View style={styles.postHeaderInfo}>
            <Text style={styles.authorName}>{item.cover_name}</Text>
            <Text style={styles.postTime}>{new Date(item.createtime).toLocaleDateString()}</Text>
          </View>
          {item.isTargeted && item.energy && (
            <View style={styles.energyBadge}>
              <Image
                source={require('@/assets/images/energy.png')}
                style={styles.energyIcon}
              />
              <Text style={styles.energyText}>{item.energy}</Text>
            </View>
          )}
        </View>

        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postContent} numberOfLines={3}>{item.content}</Text>

        {item.image_url && (
          <Image source={{ uri: item.image_url }} style={styles.postImage} />
        )}

        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleLike(item.postid);
            }}
          >
            <LikeIcon filled={item.isLiked} />
            <Text style={styles.actionText}>{item.like}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handlePostPress(item);
            }}
          >
            <CommentIcon />
            <Text style={styles.actionText}>{item.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleBookmark(item.postid);
            }}
          >
            <BookmarkIcon filled={item.isBookmarked} />
            <Text style={styles.actionText}>{item.bookmarks}</Text>
          </TouchableOpacity>
        </View>

        {item.tags && (
          <View style={styles.tagsContainer}>
            {item.tags.split(',').map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    </SwipeableRow>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
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

          <Text style={styles.headerTitle}>CampusLink</Text>
          
          <View style={styles.headerActions}>
            {/* 总能量显示 */}
            <View style={styles.totalEnergyContainer}>
              <Image
                source={require('@/assets/images/energy.png')}
                style={styles.totalEnergyIcon}
              />
              <Text style={styles.totalEnergyText}>{getTotalEnergy()}</Text>
            </View>
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

        {/* 左下角切换按钮 */}
        <View style={styles.tabBar}>
          {(['all', 'unread', 'read'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, selectedTab === tab && styles.tabActive]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                {tab === 'all' ? '所有' : tab === 'unread' ? '未读' : '已读'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 右下角发送按钮 */}
        <TouchableOpacity 
          style={styles.floatingPostButton}
          onPress={() => router.push('/post')}
          activeOpacity={0.8}
        >
          <SendButton size={58} />
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  // 新增：总能量容器样式
  totalEnergyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  totalEnergyIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  totalEnergyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8C00',
  },
  iconButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 100, // 为底部按钮留出空间
  },
  postCard: {
    marginBottom: 15,
  },
  postCardContent: {
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  postHeaderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  postTime: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  // 新增：energy 徽章样式
  energyBadge: {
    backgroundColor: '#FF8C00',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#FF8C00',
    shadowOpacity: 0.3,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
    elevation: 4,
  },
  energyIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
  energyText: {
    color: '#1E293B',
    fontSize: 13,
    fontWeight: 'bold',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconImage: {
    width: 20,
    height: 20,
  },
  actionText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  profileIconButton: {
    padding: 4,
  },
  navigationIcon: {
    width: 28,
    height: 28,
  },
  floatingPostButton: {
    position: 'absolute',
    right: 20,
    bottom: 110, // 从 90 调整到 110，与 tab bar 保持更好的间距
    zIndex: 999,
  },
  // 新增：tab bar 样式
  tabBar: {
    position: 'absolute',
    bottom: 20, // 从 0 调整到 20，往上移动 20px
    left: 20, // 添加左边距
    right: 20, // 添加右边距
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    borderRadius: 25, // 添加圆角，使其更美观
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabActive: {
    backgroundColor: '#FFB800',
  },
  tabText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#1E293B',
    fontWeight: 'bold',
  },
  // SendButton 组件样式
  shadowWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  outerWhite: {
    backgroundColor: "#FFFFFF",
  },
  gradientRing: {
    backgroundColor: '#FF9317',
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
