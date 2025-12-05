import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

// 导入API函数
import { followUser, getPost, likeComment, likePost, savePost, sendComment, unfollowUser } from '../services/api';
import { followingManager } from '../utils/followingManager';
import { getImageDisplayUrl } from '../utils/imageUtils';
import { stripHashtags } from '../utils/tags';

// 导入 CommonHeader
import CommonHeader from '../components/CommonHeader';

// 图标组件 - 使用本地图片
const LikeIcon = ({ filled = false }: { filled?: boolean }) => (
  <Image
    source={filled ? require('../assets/images/sumup.png') : require('../assets/images/nosumup.png')}
    style={styles.iconStyle}
  />
);

const BookmarkIcon = ({ filled = false }: { filled?: boolean }) => (
  <Image
    source={filled ? require('../assets/images/save.png') : require('../assets/images/nosave.png')}
    style={styles.iconStyle}
  />
);

const CommentIcon = () => (
  <Image
    source={require('../assets/images/comment.png')}
    style={styles.iconStyle}
  />
);

const SendIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M22 2L11 13"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path 
      d="M22 2L15 22L11 13L2 9L22 2Z"
      fill="#FFFFFF"
    />
  </Svg>
);

// 计时器组件 - 修复状态更新问题
const ReadingTimer = ({ 
  expectedDuration, 
  onTimeComplete,
  onEnergyGained 
}: { 
  expectedDuration: number;
  onTimeComplete: (energy: number) => void;
  onEnergyGained: (energy: number) => void;
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const hasCompletedRef = useRef(false); // 防止重复触发完成事件
  
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentTime(prev => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 处理完成状态的useEffect
  useEffect(() => {
    if (currentTime >= expectedDuration && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      setIsCompleted(true);
      
      // 完成时获得完整期待时长的能量
      const energy = Math.floor(expectedDuration / 60);
      onTimeComplete(energy);
      onEnergyGained(energy);
    }
  }, [currentTime, expectedDuration, onTimeComplete, onEnergyGained]);

  // 处理每分钟能量获得的useEffect
  useEffect(() => {
    if (currentTime > 0 && currentTime % 60 === 0 && currentTime < expectedDuration) {
      onEnergyGained(1);
    }
  }, [currentTime, expectedDuration, onEnergyGained]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 计算进度百分比
  const progress = Math.min(currentTime / expectedDuration, 1);
  const size = 80;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  
  // 计算当前获得的能量
  const currentEnergy = Math.floor(currentTime / 60);
  const completedEnergy = Math.floor(expectedDuration / 60);

  if (isCompleted) {
    // 完成状态 - 显示优化后的黄色徽章
    return (
      <View style={styles.completedContainer}>
        {/* 外层灰色渐变边框 */}
        <LinearGradient
          colors={['#F1F5F9', '#E2E8F0', '#CBD5E1']}
          style={styles.outerGradientBorder}
        >
          {/* 白色边框 */}
          <View style={styles.whiteBorder}>
            {/* 内层橙色徽章 */}
            <View style={styles.completedBadge}>
              <Image
                source={require('../assets/images/energy.png')}
                style={styles.badgeIcon}
              />
              <Text style={styles.completedBadgeText}>{completedEnergy}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // 进行中状态 - 显示圆形计时器
  return (
    <View style={styles.timerContainer}>
      <Svg width={size} height={size}>
        {/* 背景圆环 */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#EFEFEF"
          strokeWidth={stroke}
          fill="none"
        />
        {/* 进度圆环 */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#FFB800"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
          fill="none"
        />
      </Svg>
      {/* 居中显示时间文字 */}
      <Text style={styles.timerText}>
        {formatTime(currentTime)}
      </Text>
    </View>
  );
};

// 扩展的Post接口
interface TargetedPostDetail {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  timestamp: string;
  likes: number;
  bookmarks: number;
  comments: number;
  coins: number;
  images?: string[];
  tags: string[];
  commentsData: Comment[];
  isLiked?: boolean;
  isBookmarked?: boolean;
  readTime?: string; // 期待阅读时间，如 "30s", "2m", "5m"
  expectedDuration: number; // 期待阅读时长（秒）
  status?: 'active' | 'finished';
}

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  liked?: boolean;
  expanded?: boolean;
}

// 解析阅读时间字符串为秒数
const parseReadTime = (readTime: string): number => {
  const match = readTime.match(/(\d+)([smh])/);
  if (!match) return 30; // 默认30秒
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    default: return 30;
  }
};

// 时间格式化函数
const formatTime = (timestamp: string): string => {
  const now = new Date();
  const postTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return '刚刚';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}小时前`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days}天前`;
  }
};

export default function TargetedPostDetail() {
  const { postId, scrollToComments, highlightComment } = useLocalSearchParams();
  const [post, setPost] = useState<TargetedPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isReadingCompleted, setIsReadingCompleted] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const commentsHeaderRef = useRef<View>(null);
  // ✅ 移到组件顶层
  const likingRef = useRef(false);

  useEffect(() => {
    loadPostDetails();
  }, [postId]);

  // 加载帖子详情后处理滚动
  useEffect(() => {
    if (!loading && post && scrollToComments === 'true') {
      setTimeout(() => {
        scrollToCommentsSection();
      }, 500);
    }
  }, [loading, post, scrollToComments]);

  // 更新formatPostData函数
  const formatPostData = useCallback((apiData: any, postId: string): TargetedPostDetail => {
    const post = apiData.post || apiData;
    const commentsData = apiData.comments_data || apiData.comments_results || [];
    
    // 处理 tags - API 返回的是字符串，需要转换为数组
    let tags: string[] = [];
    if (post.tags) {
      if (typeof post.tags === 'string' && post.tags.trim()) {
        tags = post.tags.split(',').map((tag: string) => {
          const cleanTag = tag.trim();
          if (!cleanTag) return null;
          return cleanTag.startsWith('#') ? cleanTag : `#${cleanTag}`;
        }).filter(Boolean);
      } else if (Array.isArray(post.tags)) {
        tags = post.tags.map((tag: string) => {
          const cleanTag = tag.trim();
          if (!cleanTag) return null;
          return cleanTag.startsWith('#') ? cleanTag : `#${cleanTag}`;
        }).filter(Boolean);
      }
    }
    
    const readTime = post.readTime || '30s';
    return {
      id: post.postid || post.id || postId,
      title: post.title ?? '无标题',
      content: stripHashtags(post.content) || '',
      author: {
        name: post.cover_name || post.author || post.username || 'Anonymous',
        avatar: post.avatar,
      },
      timestamp: post.createtime || post.created_at || post.timestamp || new Date().toISOString(),
      likes: post.like || 0, // ✅ 确保使用API返回的like字段
      bookmarks: post.bookmarks || 0,
      comments: post.comments || commentsData.length || 0,
      coins: post.coins || 89,
      // 修复：使用工具函数生成完整的图片URL
      images: post.images || (post.image_url ? [getImageDisplayUrl(post.image_url)] : []),
      tags: tags,
      commentsData: commentsData.map((comment: any, index: number) => ({
        id: comment.commetsid || comment.id || comment.comment_id || `comment-${Date.now()}-${index}`,
        author: {
          name: comment.covername || comment.author || comment.username || 'Anonymous',
          avatar: comment.avatar,
        },
        content: comment.content || '',
        timestamp: comment.create_time || comment.created_at || comment.timestamp || new Date().toISOString(),
        likes: comment.likes_count || comment.like || comment.likes || 0, // ✅ 使用新的likes_count字段
        liked: comment.isLiked || false,
        expanded: false,
      })),
      isLiked: post.isLiked || false,
      isBookmarked: post.isBookmarked || false,
      readTime: readTime,
      expectedDuration: parseReadTime(readTime),
      status: post.status || 'active',
    };
  }, []);

  // 获取模拟数据
  const getMockPostData = useCallback((postId: string): TargetedPostDetail => {
    // 根据postId获取对应的模拟数据
    const mockPosts = [
      {
        id: '1',
        title: '#ACCT101 #PQSub acct 101 pq sub 求组队',
        content: '如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如题如...',
        author: { name: 'Tomas', avatar: 'placeholder' },
        readTime: '30s',
      },
      {
        id: '2',
        title: '#CUHK #SLS 第九屆「任國榮先生生命科學講座⋯⋯',
        content: '主講：沈祖堯教授\n報名鏈接：https://aaa-bbb.ccc',
        author: { name: 'cuhk_sls', avatar: 'placeholder' },
        readTime: '45s',
      },
      {
        id: '3',
        title: '#CUHK #SocialEnterprise 2024-25社會企業起動計劃：接受報名',
        content: 'Social Enterprise Startup Scheme 2024-25: Open\nThe Social Enterprise Startup Scheme...',
        author: { name: 'cuhk_osa_seds', avatar: 'placeholder' },
        readTime: '2m',
      },
      {
        id: '4',
        title: '#Elite #Internship Program 2025',
        content: 'Apply now for our elite #internship program...',
        author: { name: 'HR Department', avatar: 'placeholder' },
        readTime: '1m',
      },
      {
        id: '5',
        title: '#MATH201 #StudyGroup Final Exam Study Group',
        content: 'Looking for serious study partners for #MATH201 final exam. We will meet every weekend until the exam...',
        author: { name: 'Alice', avatar: 'placeholder' },
        readTime: '45s',
      },
    ];

    const foundPost = mockPosts.find(p => p.id === postId) || mockPosts[0];
    
    // ✅ 标题保持原样，内容清理 hashtag
    const displayTitle = foundPost.title; // 保持原样，包含 #hashtag
    const displayContent = stripHashtags(foundPost.content); // 清理内容中的 hashtag
    
    // ✅ 从原始内容提取标签，并添加 # 前缀用于显示
    const extractedTags = ['CUHK', 'SocialEnterprise', 'Startup'];
    const displayTags = extractedTags.map(tag => `#${tag}`);
    
    return {
      id: postId,
      title: displayTitle, // ✅ 包含 hashtag 的原始标题
      content: displayContent, // ✅ 清理后的内容
      author: foundPost.author,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      likes: 20,
      bookmarks: 5,
      comments: 3,
      coins: 89,
      images: Array(3).fill('placeholder'),
      tags: displayTags, // 格式化后的标签（带 # 前缀）
      commentsData: [
        {
          id: `mock-comment-1-${Date.now()}`,
          author: { name: 'Student1', avatar: 'placeholder' },
          content: 'This is very helpful, thank you!',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likes: 5,
          expanded: false,
        },
        {
          id: `mock-comment-2-${Date.now()}`,
          author: { name: 'Student2', avatar: 'placeholder' },
          content: 'When is the deadline for application?',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          likes: 2,
          expanded: false,
        },
      ],
      isLiked: false,
      isBookmarked: false,
      readTime: foundPost.readTime,
      expectedDuration: parseReadTime(foundPost.readTime),
      status: 'active',
    };
  }, []);

  // 加载帖子详情
  const loadPostDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (token && postId) {
        try {
          console.log(`Loading targeted post details for ID: ${postId}`);
          const result = await getPost(postId as string, token);
          
          if (result.success && result.data) {
            // ✅ 添加详细的调试日志
            console.log('=== Targeted Post API Response Debug ===');
            console.log('Full API response:', JSON.stringify(result.data, null, 2));
            console.log('Post object:', JSON.stringify(result.data.post || result.data, null, 2));
            console.log('Title field value:', (result.data.post || result.data)?.title);
            console.log('All available fields:', Object.keys(result.data.post || result.data));
            console.log('=== End Debug ===');
            
            const formattedPost = formatPostData(result.data, postId as string);
            console.log('Formatted post title:', formattedPost.title);
            
            setPost(formattedPost);
            setComments(formattedPost.commentsData);
            setLiked(formattedPost.isLiked || false);
            setBookmarked(formattedPost.isBookmarked || false);
          } else {
            console.log('Targeted post API failed, using mock data:', result.message);
            const mockPost = getMockPostData(postId as string);
            setPost(mockPost);
            setComments(mockPost.commentsData);
          }
        } catch (apiError) {
          console.error('Targeted post API error:', apiError);
          const mockPost = getMockPostData(postId as string);
          setPost(mockPost);
          setComments(mockPost.commentsData);
        }
      } else {
        console.log('No token or postId, using mock data');
        const mockPost = getMockPostData(postId as string);
        setPost(mockPost);
        setComments(mockPost.commentsData);
      }
    } catch (error) {
      console.error('Error loading targeted post details:', error);
      const mockPost = getMockPostData(postId as string);
      setPost(mockPost);
      setComments(mockPost.commentsData);
    } finally {
      setLoading(false);
    }
  }, [postId, formatPostData, getMockPostData]);

  // 滚动到评论区的函数
  const scrollToCommentsSection = () => {
    if (commentsHeaderRef.current && scrollViewRef.current) {
      commentsHeaderRef.current.measureLayout(
        scrollViewRef.current as any,
        (x, y) => {
          scrollViewRef.current?.scrollTo({
            y: y - 20,
            animated: true,
          });
        },
        () => {
          console.log('Failed to measure comments header');
        }
      );
    }
  };

  // 处理计时器完成 - 优化回调函数
  const handleTimeComplete = useCallback(async (energy: number) => {
    setIsReadingCompleted(true);
    
    // 可以在这里调用API更新后端状态
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token && post) {
        console.log(`Post ${post.id} marked as completed with ${energy} energy`);
      }
    } catch (error) {
      console.error('Error marking post as completed:', error);
    }
  }, [post]);

  // 处理能量获得 - 优化回调函数
  const handleEnergyGained = useCallback((energy: number) => {
    console.log(`Energy gained: ${energy}`);
    // 这里可以调用API更新后端能量状态
  }, []);

  // 提交评论
  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    if (!post) return;

    setSubmittingComment(true);
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (token) {
        const commentData = {
          postid: post.id,
          content: commentText.trim(),
          real_name: true,
        };

        console.log('Submitting comment:', commentData);
        const result = await sendComment(commentData, token);

        if (result.success) {
          const newComment: Comment = {
            id: result.data?.id || Math.random().toString(),
            author: {
              name: 'You',
              avatar: undefined,
            },
            content: commentText,
            timestamp: new Date().toISOString(),
            likes: 0,
            liked: false,
            expanded: false,
          };

          setComments(prev => [newComment, ...prev]);
          setPost(prev => prev ? {
            ...prev,
            comments: prev.comments + 1
          } : null);
          setCommentText('');
          Alert.alert('Success', 'Comment posted successfully!');
        } else {
          Alert.alert('Error', result.message || 'Failed to post comment');
        }
      } else {
        Alert.alert('Error', 'Please login to comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  // 修复点赞函数
  const handleLike = async () => {
    if (!post || likingRef.current) return; // ✅ 防连点生效
    likingRef.current = true;

    console.log('handleLike fired', { liked, id: post.id }); // 调试日志

    const newLiked = !liked;
    setLiked(newLiked);
    setPost(prev => prev ? {
      ...prev,
      likes: prev.likes + (newLiked ? 1 : -1)
    } : null);

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        console.log(`Liking targeted post ${post.id}, current state: ${liked} -> ${newLiked}`);
        const result = await likePost(post.id, token);
        
        if (result.success) {
          console.log('Targeted post liked successfully');
        } else if (result.message === 'already_liked') {
          console.log('Post was already liked, syncing state...');
          setLiked(true);
          setPost(prev => prev ? { ...prev, isLiked: true } : null);
        } else {
          console.warn('Like failed:', result.message);
          // 恢复状态
          setLiked(!newLiked);
          setPost(prev => prev ? {
            ...prev,
            likes: prev.likes + (newLiked ? -1 : 1)
          } : null);
          Alert.alert('提示', result.message || '点赞失败，请重试');
        }
      } else {
        Alert.alert('错误', '请先登录');
        // 恢复状态
        setLiked(!newLiked);
        setPost(prev => prev ? {
          ...prev,
          likes: prev.likes + (newLiked ? -1 : 1)
        } : null);
      }
    } catch (error) {
      console.error('Error liking targeted post:', error);
      // 恢复状态
      setLiked(!newLiked);
      setPost(prev => prev ? {
        ...prev,
        likes: prev.likes + (newLiked ? -1 : 1)
      } : null);
      Alert.alert('错误', '网络错误，请重试');
    } finally {
      likingRef.current = false; // ✅ 释放忙碌状态
    }
  };

  // 在组件加载时检查关注状态
  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (post?.author) {
        try {
          const token = await AsyncStorage.getItem('userToken');
          if (token) {
            const followingList = await followingManager.getFollowingList(token);
            const isUserFollowed = followingManager.isFollowing(post.author.name);
            setFollowed(isUserFollowed);
            console.log(`User ${post.author.name} following status:`, isUserFollowed);
          }
        } catch (error) {
          console.error('Error checking following status:', error);
        }
      }
    };

    if (post && !loading) {
      checkFollowingStatus();
    }
  }, [post, loading]);

  // 更新handleFollow函数
  const handleFollow = useCallback(async () => {
    if (!post?.author) return;
    
    const newFollowed = !followed;
    setFollowed(newFollowed);

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        console.log(`${newFollowed ? 'Following' : 'Unfollowing'} user ${post.author.name}`);
        
        const result = newFollowed 
          ? await followUser(post.author.name, token)
          : await unfollowUser(post.author.name, token);
        
        if (result.success) {
          console.log(`User ${newFollowed ? 'followed' : 'unfollowed'} successfully`);
          // 更新本地关注状态
          if (newFollowed) {
            followingManager.addFollowing(post.author.name);
          } else {
            followingManager.removeFollowing(post.author.name);
          }
        } else if (result.message === 'already_followed' && newFollowed) {
          console.log('User was already followed, syncing state...');
          setFollowed(true);
          followingManager.addFollowing(post.author.name);
        } else {
          console.warn(`${newFollowed ? 'Follow' : 'Unfollow'} failed:`, result.message);
          setFollowed(!newFollowed);
          Alert.alert('提示', result.message || `${newFollowed ? '关注' : '取消关注'}失败，请重试`);
        }
      } else {
        Alert.alert('错误', '请先登录');
        setFollowed(!newFollowed);
      }
    } catch (error) {
      console.error(`Error ${newFollowed ? 'following' : 'unfollowing'} user:`, error);
      setFollowed(!newFollowed);
      Alert.alert('错误', '网络错误，请重试');
    }
  }, [post, followed]);

  // 更新handleBookmark函数
  const handleBookmark = useCallback(async () => {
    if (!post) return;

    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);
    setPost(prev => prev ? {
      ...prev,
      bookmarks: prev.bookmarks + (newBookmarked ? 1 : -1)
    } : null);

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        console.log(`${newBookmarked ? 'Saving' : 'Unsaving'} post ${post.id}`);
        
        if (newBookmarked) {
          const result = await savePost(post.id, token);
          if (result.success) {
            console.log('Post saved successfully');
          } else if (result.message === 'already_saved') {
            console.log('Post was already saved, syncing state...');
            setBookmarked(true);
          } else {
            console.warn('Save failed:', result.message);
            setBookmarked(!newBookmarked);
            setPost(prev => prev ? {
              ...prev,
              bookmarks: prev.bookmarks + (newBookmarked ? -1 : 1)
            } : null);
            Alert.alert('提示', result.message || '收藏失败，请重试');
          }
        }
      } else {
        Alert.alert('错误', '请先登录');
        setBookmarked(!newBookmarked);
        setPost(prev => prev ? {
          ...prev,
          bookmarks: prev.bookmarks + (newBookmarked ? -1 : 1)
        } : null);
      }
    } catch (error) {
      console.error('Error saving post:', error);
      setBookmarked(!newBookmarked);
      setPost(prev => prev ? {
        ...prev,
        bookmarks: prev.bookmarks + (newBookmarked ? -1 : 1)
      } : null);
      Alert.alert('错误', '网络错误，请重试');
    }
  }, [post, bookmarked]);

  // 更新handleCommentLike函数
  const handleCommentLike = useCallback(async (commentId: string) => {
    // 先更新UI状态
    setComments(prev => 
      prev.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              likes: comment.likes + (comment.liked ? -1 : 1), 
              liked: !comment.liked 
            }
          : comment
      )
    );

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        console.log(`Liking comment ${commentId}`);
        const result = await likeComment(commentId, token);
        
        if (result.success) {
          console.log('Comment liked successfully');
        } else if (result.message === 'already_liked') {
          console.log('Comment was already liked, syncing state...');
          setComments(prev => 
            prev.map(comment => 
              comment.id === commentId 
                ? { ...comment, liked: true }
                : comment
            )
          );
        } else {
          console.warn('Comment like failed:', result.message);
          // 恢复状态
          setComments(prev => 
            prev.map(comment => 
              comment.id === commentId 
                ? { 
                    ...comment, 
                    likes: comment.likes + (comment.liked ? 1 : -1), 
                    liked: !comment.liked 
                  }
                : comment
            )
          );
          Alert.alert('提示', result.message || '点赞失败，请重试');
        }
      } else {
        Alert.alert('错误', '请先登录');
        // 恢复状态
        setComments(prev => 
          prev.map(comment => 
            comment.id === commentId 
              ? { 
                  ...comment, 
                  likes: comment.likes + (comment.liked ? 1 : -1), 
                  liked: !comment.liked 
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      // 恢复状态
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { 
                ...comment, 
                likes: comment.likes + (comment.liked ? 1 : -1), 
                liked: !comment.liked 
              }
            : comment
        )
      );
      Alert.alert('错误', '网络错误，请重试');
    }
  }, []);

  const toggleCommentExpand = (commentId: string) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, expanded: !comment.expanded }
          : comment
      )
    );
  };

  const handleAuthorClick = () => {
    if (post?.author) {
      router.push({
        pathname: '/Profile',
        params: {
          userId: post.author.name,
          userName: post.author.name,
          userAvatar: post.author.avatar,
        }
      });
    }
  };

  // 添加返回处理函数
  const handleBack = useCallback(() => {
    router.back();
  }, []);

  if (loading || !post) {
    return (
      <SafeAreaProvider>
        <Stack.Screen 
          options={{
            title: "Targeted Post Details",
            headerShown: false,
          }}
        />
        
        <SafeAreaView style={styles.container} edges={['top']}>
          <CommonHeader 
            onBack={handleBack}
            title="Targeted Post Details"
            showMore={false}
          />
          
          <View style={styles.loadingContainer}>
            <Text>Loading...</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack.Screen 
        options={{
          title: "Targeted Post Details",
          headerShown: false,
        }}
      />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <SafeAreaView style={styles.container} edges={['top']}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContentContainer}
            keyboardShouldPersistTaps="handled"
          >
            {/* 使用 CommonHeader 替换原来的 Header */}
            <CommonHeader 
              onBack={handleBack}
              title="Targeted Post Details"
              showMore={false}
            />

            {/* 作者信息 - 添加顶部间距 */}
            <View style={styles.authorSection}>
              <TouchableOpacity onPress={handleAuthorClick}>
                <View style={styles.authorAvatar}>
                  <Text style={styles.authorAvatarText}>
                    {post?.author.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.authorInfo} onPress={handleAuthorClick}>
                <Text style={styles.authorName}>{post?.author.name}</Text>
                <Text style={styles.postTime}>
                  {post && new Date(post.timestamp).toLocaleDateString('zh-CN')} {post && new Date(post.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.followButton, followed && styles.followedButton]} 
                onPress={handleFollow}
              >
                <Text style={[styles.followButtonText, followed && styles.followedButtonText]}>
                  {followed ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 帖子内容 */}
            <View style={styles.postContent}>
              <Text style={styles.postTitle}>{post?.title}</Text>
              <Text style={styles.postDescription}>{post?.content}</Text>
            </View>

            {/* 图片网格 */}
            <View style={styles.imageGrid}>
              {post?.images?.slice(0, 9).map((imageUrl, index) => (
                <View key={`${post.id}-image-${index}`} style={styles.imageItem}>
                  {imageUrl && getImageDisplayUrl(imageUrl) ? (
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.imageDisplay}
                      onError={(error) => {
                        console.warn('Image load failed:', error);
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', imageUrl);
                      }}
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Text style={styles.imagePlaceholderText}>图{index + 1}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* 帖子互动栏 */}
            <View style={styles.postInteractionBar}>
              <TouchableOpacity 
                style={styles.postInteractionButton}
                onPress={handleLike}
              >
                <LikeIcon filled={liked} />
                <Text style={styles.postInteractionText}>{post?.likes}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.postInteractionButton}
                onPress={handleBookmark}
              >
                <BookmarkIcon filled={bookmarked} />
                <Text style={styles.postInteractionText}>{post?.bookmarks}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.postInteractionButton}
                onPress={scrollToCommentsSection}
              >
                <CommentIcon />
                <Text style={styles.postInteractionText}>{post?.comments}</Text>
              </TouchableOpacity>
            </View>

            {/* 评论标题 */}
            <View 
              ref={commentsHeaderRef}
              style={[
                styles.commentsHeader,
                scrollToComments === 'true' && styles.highlightedCommentsHeader
              ]}
            >
              <Text style={styles.commentsTitle}>Comments</Text>
              <Text style={styles.commentsCount}>{comments.length}</Text>
            </View>

            {/* 评论列表 */}
            {comments.map((comment) => {
              const isLongContent = comment.content.length > 100;
              const displayContent = comment.expanded || !isLongContent 
                ? comment.content 
                : comment.content.substring(0, 100) + '...';
              
              const shouldHighlight = highlightComment && comment.id.includes(highlightComment as string);

              return (
                <View 
                  key={comment.id} 
                  style={[
                    styles.commentCard,
                    shouldHighlight && styles.highlightedCommentCard
                  ]}
                >
                  <View style={styles.commentHeader}>
                    <View style={styles.commentAuthorInfo}>
                      <View style={styles.commentAvatar}>
                        <Text style={styles.commentAvatarText}>
                          {comment.author.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.commentAuthorName}>{comment.author.name}</Text>
                    </View>
                    <Text style={styles.commentTime}>{formatTime(comment.timestamp)}</Text>
                  </View>

                  <View style={styles.commentContentContainer}>
                    <Text style={styles.commentContent}>{displayContent}</Text>
                    {isLongContent && (
                      <TouchableOpacity onPress={() => toggleCommentExpand(comment.id)}>
                        <Text style={styles.expandText}>
                          {comment.expanded ? 'Collapse' : 'Expand'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.commentInteraction}>
                    <TouchableOpacity 
                      style={styles.commentLikeButton}
                      onPress={() => handleCommentLike(comment.id)}
                    >
                      <LikeIcon filled={comment.liked} />
                      <Text style={styles.commentLikeText}>{comment.likes}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <CommentIcon />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {/* 底部间距为计时器和评论输入框留出空间 */}
            <View style={{ height: 160 }} />
          </ScrollView>

          {/* 计时器 - 居中在评论输入框上方 */}
          <View style={styles.timerSection}>
            <ReadingTimer 
              expectedDuration={post?.expectedDuration || 30}
              onTimeComplete={handleTimeComplete}
              onEnergyGained={handleEnergyGained}
            />
          </View>

          {/* 评论输入框 - 保持在最底部 */}
          <View style={styles.floatingCommentContainer}>
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Leave your comments..."
                placeholderTextColor="#ACB1C6"
                value={commentText}
                onChangeText={setCommentText}
                multiline
                editable={!submittingComment}
                returnKeyType="send"
                onSubmitEditing={handleSubmitComment}
                blurOnSubmit={false}
                maxLength={500}
              />
              {commentText.trim() !== '' && (
                <TouchableOpacity 
                  style={styles.sendButton}
                  onPress={handleSubmitComment}
                  disabled={submittingComment}
                  activeOpacity={0.7}
                >
                  {submittingComment ? (
                    <View style={styles.loadingDots}>
                      <Text style={styles.sendingText}>•••</Text>
                    </View>
                  ) : (
                    <SendIcon />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
}

// 样式保持不变，添加图标样式
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContentContainer: {
    paddingBottom: 0,
  },
  
  // 新增图标样式
  iconStyle: {
    width: 16,
    height: 16,
  },
  
  // 计时器区域样式
  timerSection: {
    position: 'absolute',
    bottom: 80, // 在评论输入框上方
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  
  // 计时器容器样式
  timerContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  // 计时器文字样式
  timerText: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
  },
  
  // 完成状态容器
  completedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // 外层灰色渐变边框
  outerGradientBorder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  
  // 白色边框
  whiteBorder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  
  // 优化后的完成状态徽章样式 - 参考messages.tsx
  completedBadge: {
    backgroundColor: '#FF8C00',
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    shadowColor: '#FF8C00',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  
  // 徽章图标样式
  badgeIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  
  completedBadgeText: {
    color: '#1E293B',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // 评论输入框样式 - 保持在最底部
  floatingCommentContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8F9FA',
    borderColor: '#D1D5DB',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
    maxHeight: 120,
  },
  commentInput: {
    flex: 1,
    color: '#374151',
    fontSize: 15,
    lineHeight: 20,
    paddingVertical: 8,
    paddingHorizontal: 4,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  loadingDots: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  
  // 其他样式保持不变...
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginHorizontal: 20,
    marginTop: 10,  // 添加顶部间距，避免与 CommonHeader 贴得太近
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  authorAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  authorInfo: {
    flex: 1,
    paddingVertical: 2,
  },
  authorName: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '500',
  },
  postTime: {
    color: '#ACB1C6',
    fontSize: 12,
  },
  followButton: {
    backgroundColor: '#0A66C2',
    borderRadius: 25,
    paddingVertical: 5,
    paddingHorizontal: 18,
  },
  followedButton: {
    backgroundColor: '#E5E7EB',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  followedButtonText: {
    color: '#6B7280',
  },
  postContent: {
    marginBottom: 15,
    marginHorizontal: 20,
  },
  postTitle: {
    color: '#475569',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  postDescription: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
  // 修改标签容器样式
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    marginHorizontal: 20,
  },
  
  // 新增标签按钮样式
  tagButton: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  
  // 修改标签文字样式
  tagText: {
    color: '#4A90E2',
    fontSize: 12,
    fontWeight: '500',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    marginHorizontal: 20,
    gap: 10,
  },
  imageItem: {
    width: '30%',
  },
  imagePlaceholder: {
    height: 111,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    marginLeft: 20,
  },
  commentsTitle: {
    color: '#475569',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
  },
  commentsCount: {
    color: '#ACB1C6',
    fontSize: 14,
  },
  commentCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#ACB1C633',
    borderRadius: 12,
    borderWidth: 1,
    paddingTop: 15,
    paddingBottom: 5,
    marginBottom: 15,
    marginHorizontal: 20,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginHorizontal: 20,
  },
  commentAuthorInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  commentAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  commentAuthorName: {
    color: '#475569',
    fontSize: 14,
    flex: 1,
  },
  commentTime: {
    color: '#ACB1C6',
    fontSize: 12,
  },
  commentContentContainer: {
    paddingTop: 5,
    paddingBottom: 15,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  commentContent: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
  expandText: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    color: '#0A66C2',
    fontSize: 14,
  },
  commentInteraction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#ACB1C633',
    borderTopWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  commentLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  commentLikeText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postInteractionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingBottom: 12,
    marginTop: 16,
    marginBottom: 20,
    marginHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  postInteractionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postInteractionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  highlightedCommentsHeader: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 8,
  },
  highlightedCommentCard: {
    borderColor: '#4A90E2',
    borderWidth: 2,
    backgroundColor: '#F8FBFF',
  },
  imageDisplay: {
    width: '100%',
    height: 111,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
});