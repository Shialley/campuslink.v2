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
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Filter图标组件 - 使用 emoji
const FilterIcon = () => (
  <Text style={{ fontSize: 20 }}>🔍</Text>
);

// Search图标组件 - 使用 emoji  
const SearchIcon = () => (
  <Text style={{ fontSize: 18 }}>🔎</Text>
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

// 帖子数据类型
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
}

export default function Index() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      // 模拟数据加载
      const mockPosts: Post[] = [
        {
          postid: '1',
          title: 'Welcome to CampusLink',
          content: 'This is the main feed where you can see all posts from your campus community.',
          cover_name: 'Admin',
          createtime: new Date().toISOString(),
          like: 10,
          comments: 5,
          bookmarks: 3,
          tags: 'Welcome,Info',
          isLiked: false,
          isBookmarked: false,
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

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => router.push(`/PostDetail?postid=${item.postid}`)}
    >
      <View style={styles.postHeader}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{item.cover_name[0]}</Text>
        </View>
        <View style={styles.postHeaderInfo}>
          <Text style={styles.authorName}>{item.cover_name}</Text>
          <Text style={styles.postTime}>{new Date(item.createtime).toLocaleDateString()}</Text>
        </View>
      </View>

      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent} numberOfLines={3}>{item.content}</Text>

      {item.image_url && (
        <Image source={{ uri: item.image_url }} style={styles.postImage} />
      )}

      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLike(item.postid)}
        >
          <LikeIcon filled={item.isLiked} />
          <Text style={styles.actionText}>{item.like}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push(`/PostDetail?postid=${item.postid}`)}
        >
          <CommentIcon />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleBookmark(item.postid)}
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
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* 左上角 Profile Icon */}
        <TouchableOpacity 
          style={styles.profileIconButton}
          onPress={() => router.push('/Profile')}
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>👤</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>CampusLink</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <FilterIcon />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchIcon />
        <TextInput
          style={styles.searchInput}
          placeholder="Search posts..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#94A3B8"
        />
      </View>

      {/* Posts List */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.postid}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContent}
      />

      {/* 右下角发送/Post按钮 - 最高层级 */}
      <TouchableOpacity 
        style={styles.floatingPostButton}
        onPress={() => router.push('/post')}
      >
        <Text style={styles.floatingPostButtonText}>✏️</Text>
      </TouchableOpacity>
    </View>
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
    gap: 10,
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
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  },  tagText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  // Profile icon styles
  profileIconButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    fontSize: 20,
  },
  // Floating post button styles
  floatingPostButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    zIndex: 999,
  },
  floatingPostButtonText: {
    fontSize: 28,
  },
});
