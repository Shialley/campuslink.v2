import AsyncStorage from '@react-native-async-storage/async-storage';
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
import Svg, { Path } from 'react-native-svg';

// 导入API函数
import CommonHeader from '@/components/CommonHeader';
import { followUser, getPost, likeComment, likePost, savePost, sendComment, unfollowUser } from '@/services/api';
import { followingManager } from '@/utils/followingManager';
import { getImageDisplayUrl } from '@/utils/imageUtils';
import { likeBookmarkManager } from '@/utils/likeBookmarkManager';
import { stripHashtags } from '@/utils/tags';

// 图标组件
const LikeIcon = ({ filled = false }: { filled?: boolean }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill={filled ? "#FF6B6B" : "none"}
      stroke="#475569"
      strokeWidth="1.5"
    />
  </Svg>
);

const BookmarkIcon = ({ filled = false }: { filled?: boolean }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z"
      fill={filled ? "#4A90E2" : "none"}
      stroke="#475569"
      strokeWidth="1.5"
    />
  </Svg>
);

const CommentIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
      fill="none"
      stroke="#475569"
      strokeWidth="1.5"
    />
  </Svg>
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

// 扩展的Post接口
interface PostDetail {
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
}

// 扩展的Comment接口，支持回复功能
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
  isReply?: boolean;         // 是否是回复
  replyToName?: string;      // 被回复的人名
  replyToId?: string;        // 被回复的评论ID
}

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

export default function PostDetail() {
  const { postId, scrollToComments, highlightComment } = useLocalSearchParams();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const commentsHeaderRef = useRef<View>(null);
  // ✅ 移到组件顶层
  const likingRef = useRef(false);

  // 新增评论排序函数
  const getSortedComments = useCallback((comments: Comment[]) => {
    // 创建评论映射，用于快速查找
    const commentMap = new Map(comments.map(comment => [comment.id, comment]));
    const result: Comment[] = [];
    const processedIds = new Set<string>();

    // 首先找出所有顶级评论（非回复）
    const topLevelComments = comments
      .filter(comment => !comment.isReply)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // 为每个顶级评论添加其回复
    topLevelComments.forEach(topComment => {
      if (!processedIds.has(topComment.id)) {
        result.push(topComment);
        processedIds.add(topComment.id);

        // 找到这个评论的所有回复，按时间排序
        const replies = comments
          .filter(comment => 
            comment.isReply && 
            comment.replyToId === topComment.id &&
            !processedIds.has(comment.id)
          )
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        // 添加回复到结果中
        replies.forEach(reply => {
          result.push(reply);
          processedIds.add(reply.id);
        });
      }
    });

    // 添加任何剩余的回复（可能回复的原评论不存在）
    const orphanReplies = comments
      .filter(comment => 
        comment.isReply && 
        !processedIds.has(comment.id)
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    result.push(...orphanReplies);

    return result;
  }, []);

  // 优化返回处理 - 使用 useCallback 并添加立即响应
  const handleBack = useCallback(() => {
    // 立即响应用户点击，不等待任何异步操作
    router.back();
  }, []);

 // 更新formatPostData函数，使用API返回的真实数据
  const formatPostData = useCallback((apiData: any, postId: string): PostDetail => {
    const post = apiData.post || apiData;
    const commentsData = apiData.comments_data || apiData.comments_results || [];
    
    // 处理 tags
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
    
    return {
      id: post.postid || post.id || postId,
      title: post.title ?? '无标题',
      content: post.content || '',
      author: {
        name: post.cover_name || post.author || post.username || 'Anonymous',
        avatar: post.avatar,
      },
      timestamp: post.createtime || post.created_at || post.timestamp || new Date().toISOString(),
      likes: post.like || 0, // ✅ 使用API返回的真实点赞数
      bookmarks: post.bookmarks || 0,
      comments: post.comments || commentsData.length || 0,
      coins: post.coins || 89,
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
        likes: comment.likes_count || comment.like || comment.likes || 0,
        liked: comment.isLiked || false,
        expanded: false,
        isReply: !!comment.ref,
        replyToName: comment.ref_author_name,
        replyToId: comment.ref,
      })),
      // 暂时使用API返回的状态，稍后会被状态管理器覆盖
      isLiked: post.isLiked || post.is_liked || post.liked || false,
      isBookmarked: post.isBookmarked || post.is_bookmarked || post.bookmarked || false,
    };
  }, []);

// 更新handleCommentLike函数以调用API
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
        // 将状态设置为已点赞
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

  // 更新 getMockPostData 函数
  const getMockPostData = useCallback((postId: string): PostDetail => {
    const mockComment1Id = `mock-comment-1-${Date.now()}`;
    const mockComment3Id = `mock-comment-3-${Date.now()}`;
    
    // ✅ 模拟包含 hashtag 的标题和内容
    const originalTitle = '#CUHK #SocialEnterprise 2024-25社會企業起動計劃：接受報名';
    const originalContent = 'Launched in 2015-16, the Social Enterprise Startup Scheme (SESS) has been encouraging #CUHK students and recent graduates to transform their creative business ideas into meaningful startups, and offers mentorship by the experts in real business sector. #SocialEnterprise #Startup #CUHKOSA SESS is now open for enrolment.';
    
    // ✅ 标题保持原样，内容清理 hashtag
    const displayTitle = originalTitle; // 保持原样，包含 #hashtag
    const displayContent = stripHashtags(originalContent); // 清理内容中的 hashtag
    
    // ✅ 从原始内容提取标签，并添加 # 前缀用于显示
    const extractedTags = ['CUHK', 'SocialEnterprise', 'Startup', 'CUHKOSA'];
    const displayTags = extractedTags.map(tag => `#${tag}`);
    
    return {
      id: postId as string,
      title: displayTitle, // ✅ 包含 hashtag 的原始标题
      content: displayContent, // ✅ 清理后的内容
      author: {
        name: 'Link',
        avatar: 'placeholder'
      },
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      likes: 1024,
      bookmarks: 131,
      comments: 112,
      coins: 89,
      images: Array(9).fill('placeholder'),
      tags: displayTags, // 格式化后的标签（带 # 前缀）
      commentsData: [
        {
          id: mockComment1Id,
          author: { name: 'Thomas', avatar: 'placeholder' },
          content: '感觉绝龟都不会太烂\n如果担心可以会试上英文堂，感觉比较轻松',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          likes: 17,
          expanded: false,
          isReply: false,
        },
        {
          id: `mock-comment-2-${Date.now()}`,
          author: { name: 'Alice', avatar: 'placeholder' },
          content: 'OKOK，谢谢！',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          likes: 0,
          expanded: false,
          isReply: true,
          replyToName: 'Thomas',
          replyToId: mockComment1Id,
        },
        {
          id: mockComment3Id,
          author: { name: 'Bob', avatar: 'placeholder' },
          content: 'This program sounds amazing! When is the deadline for applications?',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          likes: 5,
          expanded: false,
          isReply: false,
        },
        {
          id: `mock-comment-4-${Date.now()}`,
          author: { name: 'Charlie', avatar: 'placeholder' },
          content: 'I think the deadline is usually in March. You should check the official website.',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          likes: 2,
          expanded: false,
          isReply: true,
          replyToName: 'Bob',
          replyToId: mockComment3Id,
        },
      ],
      isLiked: false,
      isBookmarked: false,
    };
  }, []);

   // 更新加载函数，传入token给状态管理器
  const loadPostDetails = useCallback(async () => {
    try {
      setLoading(true);
      
      const token = await AsyncStorage.getItem('userToken');
      
      // 确保状态管理器已初始化（传入token）
      await likeBookmarkManager.initializeStates(token || undefined);
      console.log('Status manager debug info:', likeBookmarkManager.getDebugInfo());
      
      if (token && postId) {
        try {
          const result = await getPost(postId as string, token);
          
          if (result.success && result.data) {
            console.log('=== API Response Debug ===');
            console.log('Full API response:', JSON.stringify(result.data, null, 2));
            
            const formattedPost = formatPostData(result.data, postId as string);
            console.log('Formatted post - likes from API:', formattedPost.likes);
            
            setPost(formattedPost);
            
            // 使用状态管理器检查并设置正确的状态
            const isPostLiked = likeBookmarkManager.isLiked(formattedPost.id);
            const isPostBookmarked = likeBookmarkManager.isBookmarked(formattedPost.id);
            
            console.log(`Post ${formattedPost.id} cached states:`, {
              liked: isPostLiked,
              bookmarked: isPostBookmarked
            });
            
            setLiked(isPostLiked);
            setBookmarked(isPostBookmarked);
            
            // 使用排序后的评论
            const sortedComments = getSortedComments(formattedPost.commentsData);
            setComments(sortedComments);
          } else {
            const mockPost = getMockPostData(postId as string);
            setPost(mockPost);
            
            // 检查mock数据的状态
            const isPostLiked = likeBookmarkManager.isLiked(mockPost.id);
            const isPostBookmarked = likeBookmarkManager.isBookmarked(mockPost.id);
            setLiked(isPostLiked);
            setBookmarked(isPostBookmarked);
            
            const sortedComments = getSortedComments(mockPost.commentsData);
            setComments(sortedComments);
          }
        } catch (apiError) {
          console.error('API Error:', apiError);
          const mockPost = getMockPostData(postId as string);
          setPost(mockPost);
          
          // 检查mock数据的状态
          const isPostLiked = likeBookmarkManager.isLiked(mockPost.id);
          const isPostBookmarked = likeBookmarkManager.isBookmarked(mockPost.id);
          setLiked(isPostLiked);
          setBookmarked(isPostBookmarked);
          
          const sortedComments = getSortedComments(mockPost.commentsData);
          setComments(sortedComments);
        }
      } else {
        const mockPost = getMockPostData(postId as string);
        setPost(mockPost);
        
        // 检查mock数据的状态
        const isPostLiked = likeBookmarkManager.isLiked(mockPost.id);
        const isPostBookmarked = likeBookmarkManager.isBookmarked(mockPost.id);
        setLiked(isPostLiked);
        setBookmarked(isPostBookmarked);
        
        const sortedComments = getSortedComments(mockPost.commentsData);
        setComments(sortedComments);
      }
    } catch (error) {
      console.error('Error loading post details:', error);
      const mockPost = getMockPostData(postId as string);
      setPost(mockPost);
      
      // 检查mock数据的状态
      const isPostLiked = likeBookmarkManager.isLiked(mockPost.id);
      const isPostBookmarked = likeBookmarkManager.isBookmarked(mockPost.id);
      setLiked(isPostLiked);
      setBookmarked(isPostBookmarked);
      
      const sortedComments = getSortedComments(mockPost.commentsData);
      setComments(sortedComments);
    } finally {
      setLoading(false);
    }
  }, [postId, getSortedComments, formatPostData, getMockPostData]);

  // 加载帖子详情后处理滚动 - 移到这里确保顺序一致
  useEffect(() => {
    loadPostDetails();
  }, [postId, loadPostDetails]);

  // 加载帖子详情后处理滚动 - 移到这里确保顺序一致
  useEffect(() => {
    if (!loading && post && scrollToComments === 'true') {
      // 延迟滚动，确保组件完全渲染
      setTimeout(() => {
        scrollToCommentsSection();
      }, 500);
    }
  }, [loading, post, scrollToComments]);
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

  // 滚动到评论区的函数
  const scrollToCommentsSection = () => {
    if (commentsHeaderRef.current && scrollViewRef.current) {
      commentsHeaderRef.current.measureLayout(
        scrollViewRef.current as any,
        (x, y) => {
          scrollViewRef.current?.scrollTo({
            y: y - 20, // 额外的偏移量，让标题更好地显示
            animated: true,
          });
        },
        () => {
          console.log('Failed to measure comments header');
        }
      );
    }
  };

  // 提交评论 - 集成API
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
          ref: replyingTo?.id, // 如果是回复，传递被回复评论的ID
        };

        console.log('Submitting comment:', commentData);
        const result = await sendComment(commentData, token);

        if (result.success) {
          const newComment: Comment = {
            id: result.data?.comment_id || Math.random().toString(),
            author: {
              name: 'You',
              avatar: undefined,
            },
            content: commentText,
            timestamp: new Date().toISOString(),
            likes: 0,
            liked: false,
            expanded: false,
            isReply: !!replyingTo,
            replyToName: replyingTo?.author.name,
            replyToId: replyingTo?.id,
          };

          // 添加新评论并重新排序
          const updatedComments = [...comments, newComment];
          const sortedComments = getSortedComments(updatedComments);
          setComments(sortedComments);
          
          setPost(prev => prev ? {
            ...prev,
            comments: prev.comments + 1
          } : null);
          setCommentText('');
          setReplyingTo(null); // 清除回复状态
          Alert.alert('Success', replyingTo ? 'Reply posted successfully!' : 'Comment posted successfully!');
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

  // 新增回复处理函数
  const handleReplyToComment = useCallback((comment: Comment) => {
    setReplyingTo(comment);
    setCommentText(''); // 清空输入框
  }, []);

  // 新增取消回复的函数
  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
    setCommentText('');
  }, []);

   // 更新handleLike函数
  const handleLike = useCallback(async () => {
    if (!post || likingRef.current) return;
    likingRef.current = true;

    console.log('handleLike fired', { liked, id: post.id });

    const newLiked = !liked;
    setLiked(newLiked);
    setPost(prev => prev ? {
      ...prev,
      likes: prev.likes + (newLiked ? 1 : -1)
    } : null);

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        console.log(`Liking post ${post.id}, current state: ${liked} -> ${newLiked}`);
        const result = await likePost(post.id, token);
        
        if (result.success) {
          console.log('Post liked successfully');
          // 更新本地点赞状态
          if (newLiked) {
            likeBookmarkManager.addLikedPost(post.id);
          } else {
            likeBookmarkManager.removeLikedPost(post.id);
          }
        } else if (result.message === 'already_liked') {
          console.log('Post was already liked, syncing state...');
          setLiked(true);
          setPost(prev => prev ? { ...prev, isLiked: true } : null);
          // 同步为已点赞状态
          likeBookmarkManager.addLikedPost(post.id);
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
      console.error('Error liking post:', error);
      // 恢复状态
      setLiked(!newLiked);
      setPost(prev => prev ? {
        ...prev,
        likes: prev.likes + (newLiked ? -1 : 1)
      } : null);
      Alert.alert('错误', '网络错误，请重试');
    } finally {
      likingRef.current = false;
    }
  }, [post, liked]);

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
            // 更新本地收藏状态
            likeBookmarkManager.addBookmarkedPost(post.id);
          } else if (result.message === 'already_saved') {
            console.log('Post was already saved, syncing state...');
            setBookmarked(true);
            // 同步为已收藏状态
            likeBookmarkManager.addBookmarkedPost(post.id);
          } else {
            console.warn('Save failed:', result.message);
            setBookmarked(!newBookmarked);
            setPost(prev => prev ? {
              ...prev,
              bookmarks: prev.bookmarks + (newBookmarked ? -1 : 1)
            } : null);
            Alert.alert('提示', result.message || '收藏失败，请重试');
          }
        } else {
          // 取消收藏
          console.log('Unsave functionality may not be available in API');
          likeBookmarkManager.removeBookmarkedPost(post.id);
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
          // 恢复状态
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

  // 处理标签点击 - 修复导航功能
  const handleTagClick = useCallback((tag: string) => {
    console.log('Tag clicked:', tag);
      // 移除标签前的#号（如果有的话）
    const cleanTag = tag.startsWith('#') ? tag.substring(1) : tag;
    
    // TODO: Navigate to tag posts page when implemented
    console.log('Tag clicked:', cleanTag);
  }, []);

  // 修复loading状态的渲染 - 确保在所有Hooks之后
  if (loading || !post) {
    return (
      <SafeAreaProvider>
        <Stack.Screen 
          options={{
            title: "Post Details",
            headerShown: false,
          }}
        />
        
        <SafeAreaView style={styles.container} edges={['top']}>
          <CommonHeader 
            onBack={handleBack}
            title="Post Details" 
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
          title: "Post Details",
          headerShown: false,
        }}
      />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <SafeAreaView style={styles.container} edges={['top']}>
          <CommonHeader 
            onBack={handleBack}
            title="Post Details" 
            showMore={false}
          />

          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContentContainer}
            keyboardShouldPersistTaps="handled"
          >
            {/* 作者信息 */}
            <View style={styles.authorSection}>
              <TouchableOpacity onPress={handleAuthorClick}>
                <View style={styles.authorAvatar}>
                  <Text style={styles.authorAvatarText}>
                    {post.author.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.authorInfo} onPress={handleAuthorClick}>
                <Text style={styles.authorName}>{post.author.name}</Text>
                <Text style={styles.postTime}>
                  {new Date(post.timestamp).toLocaleDateString('zh-CN')} {new Date(post.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
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
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postDescription}>{post.content}</Text>
            </View>

            {/* 标签 - 确保onClick绑定正确 */}
            <View style={styles.tagsContainer}>
              {(post?.tags || []).map((tag: string, index: number) => (
                <TouchableOpacity 
                  key={index}
                  onPress={() => handleTagClick(tag)} // ✅ 确保函数调用正确
                  style={styles.tagButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* 图片网格 - 修复图片显示 */}
            <View style={styles.imageGrid}>
              {post.images?.slice(0, 9).map((imageUrl, index) => (
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
                <Image
                  source={liked ? 
                    require('../assets/images/sumup.png') : 
                    require('../assets/images/nosumup.png')
                  }
                  style={styles.interactionIcon}
                />
                <Text style={styles.postInteractionText}>{post.likes}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.postInteractionButton}
                onPress={handleBookmark}
              >
                <Image
                  source={bookmarked ? 
                    require('../assets/images/save.png') : 
                    require('../assets/images/nosave.png')
                  }
                  style={styles.interactionIcon}
                />
                <Text style={styles.postInteractionText}>{post.bookmarks}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.postInteractionButton}
                onPress={scrollToCommentsSection}
              >
                <Image
                  source={require('../assets/images/comment.png')}
                  style={styles.interactionIcon}
                />
                <Text style={styles.postInteractionText}>{post.comments}</Text>
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

            {/* 评论列表 - 更新以支持层次结构显示 */}
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
                    comment.isReply && styles.replyCommentCard, // 回复评论添加特殊样式
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
                    {/* 支持回复显示 */}
                    {comment.isReply && comment.replyToName ? (
                      <Text style={styles.commentContent}>
                        <Text style={styles.replyPrefix}>回复 </Text>
                        <Text style={styles.replyTarget}>{comment.replyToName}</Text>
                        <Text style={styles.replyPrefix}>：</Text>
                        <Text>{displayContent}</Text>
                      </Text>
                    ) : (
                      <Text style={styles.commentContent}>{displayContent}</Text>
                    )}
                    
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
                      <Image
                        source={comment.liked ? 
                          require('../assets/images/sumup.png') : 
                          require('../assets/images/nosumup.png')
                        }
                        style={styles.commentInteractionIcon}
                      />
                      <Text style={styles.commentLikeText}>{comment.likes}</Text>
                    </TouchableOpacity>
                    
                    {/* 回复按钮 */}
                    <TouchableOpacity
                      style={styles.commentReplyButton}
                      onPress={() => handleReplyToComment(comment)}
                    >
                      <Image
                        source={require('../assets/images/comment.png')}
                        style={styles.commentInteractionIcon}
                      />
                      <Text style={styles.commentReplyText}>Reply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* 悬浮评论输入框 - 更新以支持回复功能 */}
          <View style={styles.floatingCommentContainer}>
            {/* 回复提示条 */}
            {replyingTo && (
              <View style={styles.replyIndicator}>
                <Text style={styles.replyIndicatorText}>
                  回复 <Text style={styles.replyIndicatorName}>{replyingTo.author.name}</Text>
                </Text>
                <TouchableOpacity 
                  onPress={handleCancelReply}
                  style={styles.cancelReplyButton}
                >
                  <Text style={styles.cancelReplyText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder={replyingTo ? `回复 ${replyingTo.author.name}...` : "Leave your comments..."}
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

// 更新样式，添加回复相关样式
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
    paddingBottom: 120,
  },
  floatingCommentContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.15,
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
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
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
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginHorizontal: 20,
    marginTop: 10,  // 添加顶部间距，避免撞到边界
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    marginHorizontal: 20,
  },
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
  imageDisplay: {
    width: '100%',
    height: 111,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
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
  interactionIcon: {
    width: 16,
    height: 16,
  },
  postInteractionText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: 'normal',
  },

  commentLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  commentInteractionIcon: {
    width: 16,
    height: 16,
  },
  commentLikeText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: 'normal',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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

  // 新增回复相关样式
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyIndicatorText: {
    fontSize: 14,
    color: '#475569',
  },
  replyIndicatorName: {
    fontWeight: '600',
    color: '#2563EB',
  },
  cancelReplyButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelReplyText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  commentReplyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  commentReplyText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: 'normal',
  },
  replyPrefix: {
    color: '#475569',
    fontSize: 14,
  },
  replyTarget: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },

  // 新增回复评论的特殊样式
  replyCommentCard: {
    marginLeft: 40, // 向右缩进，表示这是回复
    marginRight: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#4A90E2',
    backgroundColor: '#FAFBFF', // 略微不同的背景色
  },
});