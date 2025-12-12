import { getUserPosts, getUserProfile, likePost, savePost } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import CommonHeader from '../components/CommonHeader';

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
  institution?: string;
  introduction?: string;
  verification?: string;
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
  const [userProfile, setUserProfile] = useState<UserProfileInterface | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  // 加载用户数据
  const loadUserData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        console.warn('No token found, redirecting to login');
        router.push('/login');
        return;
      }

      // 并行加载用户信息和帖子
      await Promise.all([
        loadUserProfile(token),
        loadUserPosts(token)
      ]);
      
    } catch (error) {
      console.error('Failed to load user data:', error);
      Alert.alert('错误', '加载用户数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载用户资料
  const loadUserProfile = async (token: string) => {
    try {
      console.log('📡 Loading user profile...');
      const result = await getUserProfile(token);
      
      console.log('✅ User profile result:', result);
      
      if (result.success && result.data) {
        // 转换 API 数据格式
        const profile: UserProfileInterface = {
          id: result.data.id || '1',
          username: result.data.username || 'Unknown User',
          real_name: result.data.real_name,
          avatar: result.data.avatar,
          school: result.data.school,
          major: result.data.major,
          institution: result.data.institution,
          introduction: result.data.introduction,
          verification: result.data.verification,
          followers: 0, // API 暂不支持，使用默认值
          following: 0, // API 暂不支持，使用默认值
          posts: 0,     // 从帖子列表计算
        };
        
        setUserProfile(profile);
        console.log('✅ User profile loaded successfully');
      } else {
        console.warn('⚠️ Failed to load user profile:', result.message);
        Alert.alert('提示', '无法加载用户信息');
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      Alert.alert('错误', '加载用户信息时发生错误');
    }
  };

  // 加载用户帖子
  const loadUserPosts = async (token: string) => {
    try {
      setPostsLoading(true);
      console.log('📡 Loading user posts...');
      
      const result = await getUserPosts(1, token);
      
      console.log('✅ User posts result:', result);
      
      if (result.success && result.data?.posts) {
        // 转换 API 数据格式
        const posts: UserPost[] = result.data.posts.map((post: any) => ({
          postid: post.postid,
          title: post.title,
          content: post.content,
          createtime: post.createtime || new Date().toISOString(),
          like: post.like || 0,
          comments: post.comments || 0,
          bookmarks: post.bookmarks || 0,
          image_url: post.image_url,
          isLiked: false,
          isBookmarked: false,
        }));
        
        setUserPosts(posts);
        
        // 更新帖子数量
        if (userProfile) {
          setUserProfile({ ...userProfile, posts: posts.length });
        }
        
        console.log('✅ User posts loaded successfully:', posts.length);
      } else {
        console.warn('⚠️ No posts found or API failed');
        setUserPosts([]);
      }
    } catch (error) {
      console.error('❌ Error loading user posts:', error);
      setUserPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  // 处理点赞
  const handleLike = async (postId: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('提示', '请先登录');
        return;
      }

      const post = userPosts.find(p => p.postid === postId);
      if (!post) return;

      setUserPosts(userPosts.map(p =>
        p.postid === postId
          ? { 
              ...p, 
              isLiked: !p.isLiked, 
              like: p.isLiked ? p.like - 1 : p.like + 1 
            }
          : p
      ));

      const result = await likePost(postId, token);
      
      if (!result.success && result.message !== 'already_liked') {
        setUserPosts(userPosts.map(p =>
          p.postid === postId
            ? { ...p, isLiked: post.isLiked, like: post.like }
            : p
        ));
        Alert.alert('提示', result.message || '点赞失败');
      }
    } catch (error) {
      console.error('❌ Error liking post:', error);
      Alert.alert('错误', '点赞时发生错误');
    }
  };

  // 处理收藏
  const handleBookmark = async (postId: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('提示', '请先登录');
        return;
      }

      const post = userPosts.find(p => p.postid === postId);
      if (!post) return;

      setUserPosts(userPosts.map(p =>
        p.postid === postId
          ? { 
              ...p, 
              isBookmarked: !p.isBookmarked, 
              bookmarks: p.isBookmarked ? p.bookmarks - 1 : p.bookmarks + 1 
            }
          : p
      ));

      const result = await savePost(postId, token);
      
      if (result.success) {
        Alert.alert('成功', '已添加到收藏');
      } else if (result.message === 'already_saved') {
        Alert.alert('提示', '该帖子已经在收藏列表中');
      } else {
        setUserPosts(userPosts.map(p =>
          p.postid === postId
            ? { ...p, isBookmarked: post.isBookmarked, bookmarks: post.bookmarks }
            : p
        ));
        Alert.alert('提示', result.message || '收藏失败');
      }
    } catch (error) {
      console.error('❌ Error bookmarking post:', error);
      Alert.alert('错误', '收藏时发生错误');
    }
  };

  // 渲染单个帖子
  const renderPost = ({ item }: { item: UserPost }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => router.push(`/PostDetail?postid=${item.postid}`)}
      activeOpacity={0.7}
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

  // 处理退出登录
  const handleLogout = async () => {
    Alert.alert(
      '退出登录',
      '确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('userToken');
            router.push('/login');
          },
        },
      ]
    );
  };

  // 获取验证状态徽章
  const getVerificationBadge = () => {
    if (!userProfile?.verification) return null;
    
    const status = userProfile.verification.toLowerCase();
    let badgeColor = '#94A3B8'; // 默认灰色
    let badgeText = '未验证';
    
    if (status === 'verified') {
      badgeColor = '#10B981'; // 绿色
      badgeText = '✓ 已验证';
    } else if (status === 'pending') {
      badgeColor = '#F59E0B'; // 橙色
      badgeText = '⏳ 待审核';
    }
    
    return (
      <View style={[styles.verificationBadge, { backgroundColor: badgeColor }]}>
        <Text style={styles.verificationText}>{badgeText}</Text>
      </View>
    );
  };

  // 加载中状态
  if (loading || !userProfile) {
    return (
      <View style={styles.container}>
        <CommonHeader 
          onBack={() => router.push('/')}
          title="个人资料"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header - 使用 CommonHeader */}
      <CommonHeader 
        onBack={() => router.push('/')}
        title="个人资料"
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => router.push('/energy')}
          >
            <View style={styles.avatar}>
              {userProfile.avatar ? (
                <Image 
                  source={{ uri: userProfile.avatar }} 
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {userProfile.username[0].toUpperCase()}
                </Text>
              )}
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

          <View style={styles.userInfoContainer}>
            <Text style={styles.username}>{userProfile.username}</Text>
            {getVerificationBadge()}
          </View>
          
          {userProfile.real_name && (
            <Text style={styles.realName}>{userProfile.real_name}</Text>
          )}
          <Text style={styles.userIdText}>用户ID: {userProfile.id}</Text>

          {userProfile.school && (
            <Text style={styles.schoolText}>🎓 {userProfile.school}</Text>
          )}
          {userProfile.institution && (
            <Text style={styles.institutionText}>🏛️ {userProfile.institution}</Text>
          )}
          {userProfile.major && (
            <Text style={styles.majorText}>📚 {userProfile.major}</Text>
          )}
          {userProfile.introduction && (
            <Text style={styles.introduction}>{userProfile.introduction}</Text>
          )}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userProfile.posts}</Text>
              <Text style={styles.statLabel}>帖子</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userProfile.followers}</Text>
              <Text style={styles.statLabel}>粉丝</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userProfile.following}</Text>
              <Text style={styles.statLabel}>关注</Text>
            </View>
          </View>
        </View>

        {/* User Posts Section */}
        {userPosts.length > 0 && (
          <View style={styles.postsSection}>
            <Text style={styles.sectionTitle}>我的帖子</Text>
            {postsLoading ? (
              <ActivityIndicator size="small" color="#4A90E2" />
            ) : (
              <FlatList
                data={userPosts}
                renderItem={renderPost}
                keyExtractor={(item) => item.postid}
                scrollEnabled={false}
                contentContainerStyle={styles.postsList}
              />
            )}
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/my-favorites')}
          >
            <Image
              source={require('@/assets/images/my_save.png')}
              style={styles.menuItemIcon}
            />
            <Text style={styles.menuText}>我的收藏</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/previous-posts')}
          >
            <Image
              source={require('@/assets/images/previous_post.png')}
              style={styles.menuItemIcon}
            />
            <Text style={styles.menuText}>发送记录</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/energy-exchange')}
          >
            <Text style={styles.menuIcon}>⚡</Text>
            <Text style={styles.menuText}>精力兑换</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/general-settings')}
          >
            <Image
              source={require('@/assets/images/general_settings.png')}
              style={styles.menuItemIcon}
            />
            <Text style={styles.menuText}>通用</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/help-support')}
          >
            <Image
              source={require('@/assets/images/help_support.png')}
              style={styles.menuItemIcon}
            />
            <Text style={styles.menuText}>帮助与支持</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/privacy-policy')}
          >
            <Image
              source={require('@/assets/images/privacy_notice.png')}
              style={styles.menuItemIcon}
            />
            <Text style={styles.menuText}>隐私政策</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/terms-of-service')}
          >
            <Image
              source={require('@/assets/images/term_of_use.png')}
              style={styles.menuItemIcon}
            />
            <Text style={styles.menuText}>使用规范</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <Image
              source={require('@/assets/images/switch_account.png')}
              style={styles.menuItemIcon}
            />
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
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748B',
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatarContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#4A90E2',
  },
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
  editIconImage: {
    width: 16,
    height: 16,
    tintColor: '#4A90E2',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  verificationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verificationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  realName: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 5,
  },
  userIdText: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 15,
  },
  schoolText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 5,
  },
  institutionText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 3,
  },
  majorText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 3,
  },
  introduction: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginTop: 15,
    paddingHorizontal: 20,
    lineHeight: 20,
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
  postsSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
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
    borderColor: '#F3F4F6',
    marginBottom: 10,
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
  },
  actionText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    paddingVertical: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemIcon: {
    width: 24,
    height: 24,
    marginRight: 15,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 30,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
  },
  menuArrow: {
    fontSize: 20,
    color: '#CBD5E1',
  },
  logoutItem: {
    borderBottomWidth: 0,
    marginTop: 5,
  },
});
