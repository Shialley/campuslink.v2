import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// 点赞图标
const LikeIcon = ({ filled = false }: { filled?: boolean }) => (
  <Image
    source={filled ? require('@/assets/images/sumup.png') : require('@/assets/images/nosumup.png')}
    style={styles.interactionIcon}
  />
);

// 收藏图标
const BookmarkIcon = ({ filled = false }: { filled?: boolean }) => (
  <Image
    source={filled ? require('@/assets/images/save.png') : require('@/assets/images/nosave.png')}
    style={styles.interactionIcon}
  />
);

// 评论图标
const CommentIcon = () => (
  <Image
    source={require('@/assets/images/comment.png')}
    style={styles.interactionIcon}
  />
);

// 用户数据接口
interface UserProfileInterface {
  id: string;
  username: string;
  real_name?: string;
  avatar?: string;
  school?: string;
  major?: string;
  introduction?: string;
  followers: number;
  following: number;
  posts: number;
}

// 帖子数据接口
interface UserPost {
  postid: string;
  title: string;
  content: string;
  createtime: string;
  like: number;
  comments: number;
  bookmarks: number;
  image_url?: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export default function Profile() {
  const [userProfile] = useState<UserProfileInterface>({
    id: '1',
    username: 'test_user',
    real_name: 'Test User',
    school: 'Hong Kong University',
    major: 'Computer Science',
    introduction: 'Hello! Welcome to my profile.',
    followers: 120,
    following: 80,
    posts: 15,
  });

  const [userPosts, setUserPosts] = useState<UserPost[]>([
    {
      postid: '1',
      title: 'My First Post',
      content: 'This is my first post on CampusLink!',
      createtime: new Date().toISOString(),
      like: 5,
      comments: 2,
      bookmarks: 1,
      isLiked: false,
      isBookmarked: false,
    },
  ]);

  const handleLike = (postId: string) => {
    setUserPosts(userPosts.map(post =>
      post.postid === postId
        ? { ...post, isLiked: !post.isLiked, like: post.isLiked ? post.like - 1 : post.like + 1 }
        : post
    ));
  };

  const handleBookmark = (postId: string) => {
    setUserPosts(userPosts.map(post =>
      post.postid === postId
        ? { ...post, isBookmarked: !post.isBookmarked, bookmarks: post.isBookmarked ? post.bookmarks - 1 : post.bookmarks + 1 }
        : post
    ));
  };

  const renderPost = ({ item }: { item: UserPost }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => router.push(`/PostDetail?postid=${item.postid}`)}
    >
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent} numberOfLines={2}>{item.content}</Text>

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
    </TouchableOpacity>
  );
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => router.push('/login'),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => router.push('/energy')}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userProfile.username[0].toUpperCase()}
              </Text>
            </View>
            {/* Edit Icon */}
            <TouchableOpacity 
              style={styles.editIconButton}
              onPress={() => router.push('/edit-profile')}
            >
              <Image 
                source={require('@/assets/images/edit_profile.png')}
                style={styles.editIconImage}
  />
            </TouchableOpacity>
          </TouchableOpacity>

          <Text style={styles.username}>{userProfile.username}</Text>
          {userProfile.real_name && (
            <Text style={styles.realName}>{userProfile.real_name}</Text>
          )}
          <Text style={styles.userIdText}>用户ID: 12345678</Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userProfile.posts}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userProfile.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userProfile.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/my-favorites')}
          >
            <Text style={styles.menuIcon}>📑</Text>
            <Text style={styles.menuText}>我的收藏</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/previous-posts')}
          >
            <Text style={styles.menuIcon}>✉️</Text>
            <Text style={styles.menuText}>发送记录</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/general-settings')}
          >
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuText}>通用</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/help-support')}
          >
            <Text style={styles.menuIcon}>❓</Text>
            <Text style={styles.menuText}>帮助与支持</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/privacy-policy')}
          >
            <Text style={styles.menuIcon}>🛡️</Text>
            <Text style={styles.menuText}>隐私政策</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/terms-of-service')}
          >
            <Text style={styles.menuIcon}>📄</Text>
            <Text style={styles.menuText}>使用规范</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <Text style={styles.menuIcon}>🚪</Text>
            <Text style={styles.menuText}>切换账号/退出登录</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  backButton: {
    fontSize: 24,
    color: '#1E293B',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  headerSpacer: {
    width: 24,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 5,
  },
  realName: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 10,
  },
  schoolText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 10,
  },
  majorText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 5,
  },
  introduction: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginTop: 15,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  actionButtonsContainer: {
    width: '100%',
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  postsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 15,
  },
  postsList: {
    gap: 15,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
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
    height: 150,
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
  interactionIcon: {
    width: 20,
    height: 20,
  },  actionText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  // Edit icon styles
  editIconButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  editIcon: {
    fontSize: 14,
  },
  userIdText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  editIconImage: {
  width: 16,
  height: 16,
  tintColor: '#4A90E2', // This will color the icon if it's a simple shape
  },
  // Menu styles
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    paddingVertical: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 30,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  menuArrow: {
    fontSize: 24,
    color: '#94A3B8',
  },
  logoutItem: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
});
