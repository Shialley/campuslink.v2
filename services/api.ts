import { Platform } from 'react-native';

const USE_MOCK_API = __DEV__ && false; // 默认关闭，需要时改为 true
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://api.campusinone.com/v1";

// ✅ 测试用户信息 - 保留用于开发测试
export const TEST_USER = {
  username: "test",
  password: "newpassword123", 
  email: "test@hku.com",
  langs: "zh-cn",
};

export const TEST_LOGIN_USER: LoginRequest = {
  email: "test@hku.com",
  password: "newpassword123",
};

export const TEST_REGISTER_USER: RegisterRequest = {
  username: "test",
  password: "newpassword123",
  email: "test@hku.com", 
  langs: "zh-cn",
};

// ✅ Mock 数据 - 直接在 API 文件中定义
const MOCK_USER_PROFILE: UserProfile = {
  id: "1",
  username: "test",
  email: "test@hku.com",
  real_name: "测试用户",
  avatar: "test-avatar.jpg",
  school: "香港大学",
  type: "student",
  major: "计算机科学",
  institution: "工程学院",
  introduction: "这是一个测试用户",
  verification: "verified"
};

// 更新 Mock 数据以匹配真实 API 结构
const MOCK_POSTS = [
  {
    postid: "1", // 使用 postid 而不是 id
    title: "测试帖子1",
    content: "这是第一个测试帖子的内容",
    cover_name: "test", // 使用 cover_name 而不是 author
    createtime: "2024-01-01T00:00:00Z", // 使用 createtime
    like: 5, // 使用 like 而不是 likes
    comments: 3,
    bookmarks: 2,
    tags: "CUHK,Study,GroupWork", // 使用字符串而不是数组
    hotness: 50,
    image_url: null
  },
  {
    postid: "2", 
    title: "测试帖子2",
    content: "这是第二个测试帖子的内容",
    cover_name: "test",
    createtime: "2024-01-02T00:00:00Z",
    like: 8,
    comments: 2,
    bookmarks: 4,
    tags: "CUHK,SocialEnterprise,Startup",
    hotness: 80,
    image_url: "https://example.com/test-image.jpg"
  },
  {
    postid: "3",
    title: "社会企业项目分享",
    content: "分享一个关于社会企业的创新项目想法...",
    cover_name: "social_innovator",
    createtime: "2024-01-03T00:00:00Z",
    like: 15,
    comments: 8,
    bookmarks: 6,
    tags: "SocialEnterprise,Innovation,Impact",
    hotness: 120,
    image_url: null
  },
  {
    postid: "4",
    title: "CUHK 校园生活指南",
    content: "新生必看的校园生活小贴士...",
    cover_name: "campus_helper",
    createtime: "2024-01-04T00:00:00Z",
    like: 25,
    comments: 12,
    bookmarks: 18,
    tags: "CUHK,CampusLife,Tips",
    hotness: 200,
    image_url: null
  }
];

const MOCK_COMMENTS = [
  {
    commetsid: "1", // 使用 commetsid 而不是 id
    postid: "1",
    content: "这是一个测试评论",
    covername: "test", // 使用 covername 而不是 author
    create_time: "2024-01-01T01:00:00Z", // 使用 create_time
    likes_count: 0, // ✅ 新增字段
    ref: null
  },
  {
    commetsid: "2",
    postid: "1", 
    content: "这是一个回复评论",
    covername: "alice",
    create_time: "2024-01-01T02:00:00Z",
    likes_count: 2, // ✅ 新增字段
    ref: "1" // 回复评论ID为1的评论
  }
];

// ✅ 接口定义
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  langs?: string;
}

export interface PostData {
  title: string; // 必填项
  content: string;
  image_url?: string;
  ref?: string;
  real_name: boolean;
  tags?: string; // 标签字段（可选）
  type?: 'normal' | 'targeted'; // 新增：消息类型参数
}

export interface CommentData {
  postid: string;
  content: string;
  real_name?: boolean;
  ref?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  real_name?: string;
  avatar?: string;
  school?: string;
  type?: string;
  major?: string;
  institution?: string;
  introduction?: string;
  verification?: string;
}

// ✅ Mock API 函数 - 只保留一份，避免重复声明
const mockLoginUser = async (loginData: LoginRequest): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (loginData.email === TEST_LOGIN_USER.email && loginData.password === TEST_LOGIN_USER.password) {
    return {
      success: true,
      token: "mock-jwt-token-12345",
      data: { user: MOCK_USER_PROFILE }
    };
  } else {
    return {
      success: false,
      message: "Invalid credentials"
    };
  }
};

const mockRegisterUser = async (registerData: RegisterRequest): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    message: "Verification email sent.",
    data: { message: "Registration successful" }
  };
};

// 修复 mockGetPosts 函数中的标签过滤逻辑
const mockGetPosts = async (page: number = 1, tagFilter?: string): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  let filteredPosts = MOCK_POSTS;
  
  // ✅ 修复：正确处理字符串类型的 tags 和标签过滤
  if (tagFilter) {
    console.log('Filtering mock posts by tag:', tagFilter);
    filteredPosts = MOCK_POSTS.filter(post => 
      post.tags && typeof post.tags === 'string' && 
      post.tags.toLowerCase().includes(tagFilter.toLowerCase())
    );
    console.log('Filtered mock posts:', filteredPosts);
  }
  
  return {
    success: true,
    data: {
      posts: filteredPosts,
      page: page,
      total_pages: 2,
      total_posts: filteredPosts.length
    }
  };
};

const mockSendPost = async (postData: PostData): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('Mock sendPost received data:', {
    ...postData,
    type: postData.type || 'normal'
  });
  
  return {
    success: true,
    data: {
      post_id: "new-post-" + Date.now(),
      message: "Post created successfully!",
      type: postData.type || 'normal'
    }
  };
};

// 修复：更新 mockGetPost 函数以匹配新的数据结构
const mockGetPost = async (postid: string): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const post = MOCK_POSTS.find(p => p.postid === postid);
  if (post) {
    return {
      success: true,
      data: { 
        post, 
        comments_results: MOCK_COMMENTS.filter(c => c.postid === postid) // 使用 comments_results
      }
    };
  } else {
    return {
      success: false,
      message: "Post not found!"
    };
  }
};

const mockSendComment = async (commentData: CommentData): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    success: true,
    data: {
      message: "Comment added successfully.",
      comment_id: "new-comment-" + Date.now()
    }
  };
};

const mockGetUserProfile = async (): Promise<ApiResponse<UserProfile>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    data: MOCK_USER_PROFILE
  };
};

const mockUpdateUserProfile = async (profileData: Partial<UserProfile>): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    data: { message: "Profile updated successfully" }
  };
};

const mockUploadImage = async (): Promise<ApiResponse<{message: string, key: string}>> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    success: true,
    data: {
      message: "Image uploaded successfully!",
      key: "mock-image-key-" + Date.now() + ".jpg"
    }
  };
};

const mockGetUserPosts = async (page: number = 1): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { 
    success: true, 
    data: { 
      posts: MOCK_POSTS, 
      page, 
      total_pages: 1,
      message: MOCK_POSTS.length > 0 ? undefined : 'No posts found.'
    } 
  };
};

const mockGetUserComments = async (userid: string, page: number = 1): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { 
    success: true, 
    data: { 
      comments: MOCK_COMMENTS.filter(c => c.covername === userid), // 使用 covername 而不是 author
      page, 
      total_pages: 1 
    } 
  };
};

// 其他简单的 mock 函数
const mockLikePost = async (postId: string): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { success: true, data: { message: "Post liked successfully" } };
};

const mockBookmarkPost = async (postId: string): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { success: true, data: { message: "Post bookmarked successfully" } };
};

const mockChangePassword = async (oldPassword: string, newPassword: string): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, data: { message: "Password changed successfully" } };
};

const mockGetDirectMessages = async (): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, data: { messages: [] } };
};

const mockGetTargetedMessages = async (): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, data: { messages: [] } };
};

const mockGetCommentNotifications = async (): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, data: { notifications: [] } };
};

const mockSendDirectMessage = async (recipientId: string, content: string): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return { success: true, data: { message: "Message sent successfully" } };
};

const mockMarkMessageAsRead = async (messageId: string): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { success: true, data: { message: "Message marked as read" } };
};

const mockFollowUser = async (followedId: string): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, data: { message: "User followed successfully" } };
};

const mockUnfollowUser = async (followedId: string): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, data: { message: "User unfollowed successfully" } };
};

const mockGetFollowing = async (): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, data: { following: [] } };
};

const mockSavePost = async (postId: string): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { success: true, data: { message: "Post saved successfully" } };
};

const mockGetSaves = async (): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, data: { saves: [] } };
};

const mockGetLikeCount = async (postId: string): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { success: true, data: { likes: 5 } };
};

const mockGetEnergyPoint = async (): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { success: true, data: { energy_point: 100 } };
};

// ✅ 真实 API 函数 - 按功能分组，确保没有重复
// 认证相关
export const loginUser = async (loginData: LoginRequest): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for login');
    return mockLoginUser(loginData);
  }
  
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: loginData.email,
        password: loginData.password
      }),
    });

    const data = await response.json();

    if (response.status === 200) {
      return {
        success: true,
        token: data.token,
        data: data,
      };
    } else if (response.status === 401) {
      return {
        success: false,
        message: data.message || 'Login failed!',
      };
    } else {
      return {
        success: false,
        message: data.message || 'Login failed',
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
};

// 注册API
export const registerUser = async (registerData: RegisterRequest): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for register');
    return mockRegisterUser(registerData);
  }
  
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: registerData.username,
        password: registerData.password,
        email: registerData.email,
        langs: registerData.langs || 'en'
      }),
    });

    const data = await response.json();

    if (response.status === 200) {
      return {
        success: true,
        data: data,
        message: data.message || 'Verification email sent.'
      };
    } else if (response.status === 400) {
      return {
        success: false,
        message: data.message || 'Missing required fields.',
      };
    } else if (response.status === 409) {
      return {
        success: false,
        message: data.message || 'Email already exists.',
      };
    } else {
      return {
        success: false,
        message: data.message || 'Registration failed',
      };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
};

// 修改密码API
export const changePassword = async (oldPassword: string, newPassword: string, token: string): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for changePassword');
    return mockChangePassword(oldPassword, newPassword);
  }
  
  try {
    const response = await fetch(`${BASE_URL}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify({
        oldPassword,
        newPassword,
      }),
    });

    const data = await response.json();

    if (response.status === 200) {
      return {
        success: true,
        data: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to change password',
      };
    }
  } catch (error) {
    console.error('Change password error:', error);
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
};

// 获取单个帖子及评论API
export const getPost = async (postid: string, token: string): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for getPost');
    return mockGetPost(postid);
  }
  
  try {
    const response = await fetch(`${BASE_URL}/get_post?postid=${postid}`, {
      method: 'GET',
      headers: {
        'x-access-token': token,
      },
    });

    const data = await response.json();
    
    // ✅ 添加调试日志
    console.log('=== getPost API Debug ===');
    console.log('Response status:', response.status);
    console.log('Raw response data:', JSON.stringify(data, null, 2));
    console.log('========================');

    if (response.status === 200) {
      return {
        success: true,
        data: {
          post: data.post,
          comments_data: data.comments_results || [],
        },
      };
    } else if (response.status === 400) {
      return {
        success: false,
        message: data.message || 'Post ID is missing!',
      };
    } else if (response.status === 404) {
      return {
        success: false,
        message: data.message || 'Post not found!',
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch post',
      };
    }
  } catch (error) {
    console.error('Get post error:', error);
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
};

// 发表评论API
export const sendComment = async (commentData: CommentData, token: string): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for sendComment');
    return mockSendComment(commentData);
  }
  
  try {
    const response = await fetch(`${BASE_URL}/send_comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify({
        postid: commentData.postid,
        content: commentData.content,
        real_name: commentData.real_name || false,
        ref: commentData.ref,
      }),
    });

    const data = await response.json();

    if (response.status === 200) {
      return {
        success: true,
        data: {
          message: data.message || 'Comment added successfully.',
          comment_id: data.comment_id,
        },
      };
    } else if (response.status === 400) {
      return {
        success: false,
        message: data.message || 'Missing required fields.',
      };
    } else if (response.status === 404) {
      return {
        success: false,
        message: data.message || 'Post not found.',
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to send comment',
      };
    }
  } catch (error) {
    console.error('Send comment error:', error);
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
};

// 新增：获取帖子列表API - 支持标签过滤参数
export const getPosts = async (page: number = 1, token: string, tagFilter?: string): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for getPosts');
    return mockGetPosts(page, tagFilter);
  }
  
  try {
    let url = `${BASE_URL}/get_posts?page=${page}`;
    
    // ✅ 如果提供了标签过滤参数，添加到URL中
    if (tagFilter) {
      url += `&tags=${encodeURIComponent(tagFilter)}`;
    }

    console.log('getPosts API URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-access-token': token,
      },
    });

    const data = await response.json();
    
    console.log('=== getPosts API Debug ===');
    console.log('Response status:', response.status);
    console.log('Raw response data:', JSON.stringify(data, null, 2));
    console.log('========================');

    if (response.status === 200) {
      return {
        success: true,
        data: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch posts',
      };
    }
  } catch (error) {
    console.error('Get posts error:', error);
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
};

// 发送帖子API - 改进错误处理
export const sendPost = async (postData: PostData, token: string): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for sendPost');
    return mockSendPost(postData);
  }
  
  try {
    // 添加更详细的调试信息
    console.log('=== sendPost API Debug ===');
    console.log('Base URL:', BASE_URL);
    console.log('Endpoint:', `${BASE_URL}/send_post`);
    console.log('Token:', token ? 'Present' : 'Missing');
    console.log('Post Data:', JSON.stringify(postData, null, 2));
    console.log('========================');

    const response = await fetch(`${BASE_URL}/send_post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify({
        title: postData.title,
        content: postData.content,
        image_url: postData.image_url || "",
        ref: postData.ref || "",
        real_name: postData.real_name,
        tags: postData.tags || "",
        type: postData.type || "normal", // 新增：type 参数，默认为 normal
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // 检查 Content-Type
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);

    // 如果返回 HTML，说明遇到了服务器错误页面
    if (contentType && contentType.includes('text/html')) {
      const htmlText = await response.text();
      console.error('Server returned HTML error page:', htmlText.substring(0, 500));
      
      return {
        success: false,
        message: 'Server error: API endpoint not found or server is down',
      };
    }

    // 尝试解析 JSON 响应
    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      console.error('HTTP error response:', response.status, responseText);
      
      let errorMessage = 'Failed to send post';
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Server error (${response.status})`;
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }

    // 解析成功响应
    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse success response as JSON:', parseError);
      return {
        success: true,
        data: { message: 'Post sent successfully' },
      };
    }
    
    console.log('Success response:', data);
    return {
      success: true,
      data: data,
    };
    
  } catch (error) {
    console.error('Network error in sendPost:', error);
    
    // 检查是否是网络连接问题
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        message: 'Network connection failed. Please check your internet connection.',
      };
    }
    
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
};

// 批量上传图片的辅助函数
export const uploadImages = async (imageUris: string[], token: string): Promise<string[]> => {
  const uploadedKeys: string[] = [];
  
  for (const imageUri of imageUris) {
    try {
      const result = await uploadImage(imageUri, token);
      if (result.success && result.data?.key) {
        uploadedKeys.push(result.data.key);
      } else {
        console.warn('Failed to upload image:', result.message);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }
  
  return uploadedKeys;
};

// 获取用户帖子API（合并后的唯一版本）
export const getUserPosts = async (
  page: number = 1,
  token: string
): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for getUserPosts');
    return mockGetUserPosts(page);
  }

  try {
    const response = await fetch(`${BASE_URL}/get_user_posts?page=${page}`, {
      method: 'GET',
      headers: { 'x-access-token': token },
    });

    // 有些情况下后端可能无 body，这里做个安全 parse
    let data: any = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (response.ok) {
      return { success: true, data };
    }
    if (response.status === 404) {
      return { success: false, message: (data && data.message) || 'User not found.' };
    }
    return { success: false, message: (data && data.message) || 'Failed to fetch user posts' };
  } catch (error) {
    console.error('Get user posts error:', error);
    return { success: false, message: 'Network error or server unavailable' };
  }
};

// 新增：获取用户信息API
export const getUserProfile = async (token: string): Promise<ApiResponse<UserProfile>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for getUserProfile');
    return mockGetUserProfile();
  }
  
  try {
    const response = await fetch(`${BASE_URL}/get_user_profile`, {
      method: 'GET',
      headers: {
        'x-access-token': token,
      },
    });

    const data = await response.json();

    if (response.status === 200) {
      return {
        success: true,
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch user profile',
      };
    }
  } catch (error) {
    console.error('Get user profile error:', error);
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
};

// 新增：更新用户信息API
export const updateUserProfile = async (profileData: Partial<UserProfile>, token: string): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for updateUserProfile');
    return mockUpdateUserProfile(profileData);
  }
  
  try {
    const response = await fetch(`${BASE_URL}/update_user_profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (response.status === 200) {
      return {
        success: true,
        data: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to update profile',
      };
    }
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
};

// 新增：点赞帖子API
export const likePost = async (postId: string, token: string): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for likePost');
    return mockLikePost(postId);
  }
  
  try {
    const response = await fetch(`${BASE_URL}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify({ 
        post_id: postId,
        postid: postId // ✅ 兼容多种参数格式
      }),
    });

    // ✅ JSON容错处理
    let data: any = null;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.warn('Response is not valid JSON:', jsonError);
      // 可能是204 No Content或其他非JSON响应
    }
    
    console.log('=== likePost API Debug ===');
    console.log('Request body:', { post_id: postId, postid: postId });
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    console.log('========================');

    // ✅ 宽松成功判定
    if (response.ok) { // 200-299都算成功
      return {
        success: true,
        data: data,
        message: data?.message || 'Post liked successfully.',
      };
    }

    // ✅ 特殊处理"已点赞"情况 - 支持400和409状态码
    const msg = (data?.message || '').toLowerCase();
    if ((response.status === 400 || response.status === 409) && 
        (msg.includes('already') || msg.includes('liked'))) {
      return {
        success: false,
        message: 'already_liked',
        data: { already_liked: true }
      };
    }

    // 其他错误
    return {
      success: false,
      message: data?.message || `HTTP ${response.status}`,
    };
  } catch (error) {
    console.error('Like post error:', error);
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
};

// 新增：收藏帖子API
export const bookmarkPost = async (postId: string, token: string): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for bookmarkPost');
    return mockBookmarkPost(postId);
  }
  
  try {
    const response = await fetch(`${BASE_URL}/bookmark_post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify({ postid: postId }),
    });

    const data = await response.json();

    if (response.status === 200) {
      return {
        success: true,
        data: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to bookmark post',
      };
    }
  } catch (error) {
    console.error('Bookmark post error:', error);
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
};

// 新增：上传图片API - 更新为正确的接口规范
export const uploadImage = async (imageUri: string, token: string): Promise<ApiResponse<{message: string, key: string}>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for uploadImage');
    return mockUploadImage();
  }
  
  try {
    console.log('=== uploadImage API Debug ===');
    console.log('Image URI:', imageUri);
    console.log('Token:', token ? 'Present' : 'Missing');
    console.log('Platform:', Platform.OS);

    const formData = new FormData();
    
    if (Platform.OS === 'web') {
      // Web端特殊处理
      if (imageUri.startsWith('data:')) {
        // 如果是 base64 数据
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('file', blob, 'image.jpg');
        console.log('Web: Appended blob from data URI');
      } else if (imageUri.startsWith('blob:')) {
        // 如果是 blob URL
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('file', blob, 'image.jpg');
        console.log('Web: Appended blob from blob URL');
      } else {
        // 其他情况，尝试作为URL处理
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('file', blob, 'image.jpg');
        console.log('Web: Appended blob from URL');
      }
    } else {
      // 移动端处理
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);
      console.log('Mobile: Appended file object');
    }

    console.log('FormData prepared, sending request to:', `${BASE_URL}/upload_image`);

    const response = await fetch(`${BASE_URL}/upload_image`, {
      method: 'POST',
      headers: {
        'x-access-token': token,
        // 不要手动设置 Content-Type，让浏览器自动设置边界
      },
      body: formData,
    });

    console.log('Upload response status:', response.status);
    console.log('Upload response headers:', Object.fromEntries(response.headers.entries()));

    // 检查响应类型
    const contentType = response.headers.get('content-type');
    console.log('Response Content-Type:', contentType);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed with status:', response.status, errorText);
      return {
        success: false,
        message: `Upload failed: ${response.status} ${errorText}`,
      };
    }

    // 尝试解析响应
    const responseText = await response.text();
    console.log('Raw upload response:', responseText);

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse upload response as JSON:', parseError);
      return {
        success: false,
        message: 'Invalid response format from server',
      };
    }

    console.log('Parsed upload response:', data);

    if (data.key) {
      console.log('✅ Upload successful, key:', data.key);
      return {
        success: true,
        data: {
          message: data.message || 'Image uploaded successfully!',
          key: data.key
        },
      };
    } else {
      console.error('❌ No image key returned from server');
      return {
        success: false,
        message: data.message || 'No image key returned from server',
      };
    }
  } catch (error) {
    console.error('Upload image error:', error);
    return {
      success: false,
      message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

// 获取图片API - 这个不需要 mock，直接返回真实结果
export const getImage = async (key: string, token: string): Promise<Blob | null> => {
  try {
    const response = await fetch(`${BASE_URL}/get_image/${key}`, {
      method: 'GET',
      headers: {
        'x-access-token': token,
      },
    });

    if (response.status === 200) {
      return await response.blob();
    } else {
      console.error('Failed to fetch image:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Get image error:', error);
    return null;
  }
};

// 获取图片URL的辅助函数
export const getImageUrl = (key: string, token?: string): string => {
  if (!key) return '';
  
  // 如果已经是完整URL，直接返回
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return key;
  }
  
  // 生成完整的图片URL
  return `${BASE_URL}/get_image/${key}`;
};

// 新增：获取直接消息API
export const getDirectMessages = async (token: string): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for getDirectMessages');
    return mockGetDirectMessages();
  }
  
  try {
    const response = await fetch(`${BASE_URL}/get_direct_messages`, {
      method: 'GET',
      headers: {
        'x-access-token': token,
      },
    });

    const data = await response.json();

    if (response.status === 200) {
      return {
        success: true,
        data: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch direct messages',
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
};

// 新增：获取定向消息API
export const getTargetedMessages = async (token: string): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for getTargetedMessages');
    return mockGetTargetedMessages();
  }
  
  try {
    const response = await fetch(`${BASE_URL}/get_targeted_messages`, {
      method: 'GET',
      headers: {
        'x-access-token': token,
      },
    });

    const data = await response.json();

    if (response.status === 200) {
      return {
        success: true,
        data: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch targeted messages',
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
};

// 新增：获取评论通知API
export const getCommentNotifications = async (token: string): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for getCommentNotifications');
    return mockGetCommentNotifications();
  }
  
  try {
    const response = await fetch(`${BASE_URL}/get_comment_notifications`, {
      method: 'GET',
      headers: {
        'x-access-token': token,
      },
    });

    const data = await response.json();

    if (response.status === 200) {
      return {
        success: true,
        data: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch comment notifications',
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
};

// 新增：发送私信API
export const sendDirectMessage = async (recipientId: string, content: string, token: string): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for sendDirectMessage');
    return mockSendDirectMessage(recipientId, content);
  }
  
  try {
    const response = await fetch(`${BASE_URL}/send_direct_message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify({
        recipient_id: recipientId,
        content: content,
      }),
    });

    const data = await response.json();

    if (response.status === 200) {
      return {
        success: true,
        data: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to send message',
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
};

// 新增：标记消息为已读API
export const markMessageAsRead = async (messageId: string, token: string): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for markMessageAsRead');
    return mockMarkMessageAsRead(messageId);
  }
  
  try {
    const response = await fetch(`${BASE_URL}/mark_message_read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify({
        message_id: messageId,
      }),
    });

    const data = await response.json();

    if (response.status === 200) {
      return {
        success: true,
        data: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to mark message as read',
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
};

// 新增：关注用户API
export const followUser = async (followedId: string, token: string): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for followUser');
    return mockFollowUser(followedId);
  }
  
  try {
    const response = await fetch(`${BASE_URL}/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify({ followed_id: followedId }),
    });

    const data = await response.json();

    if (response.status === 200) {
      return {
        success: true,
        data: data,
      };
    } else if (response.status === 400) {
      const message = data.message || '';
      if (message.includes('Already followed')) {
        return {
          success: false,
          message: 'already_followed',
          data: { already_followed: true }
        };
      }
      return {
        success: false,
        message: data.message || 'followed_id is required!',
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to follow user',
      };
    }
  } catch (error) {
    console.error('Follow user error:', error);
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
};

// 新增：取消关注用户API
export const unfollowUser = async (followedId: string, token: string): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for unfollowUser');
    return mockUnfollowUser(followedId);
  }
  
  try {
    const response = await fetch(`${BASE_URL}/unfollow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify({ followed_id: followedId }),
    });

    const data = await response.json();

    if (response.status === 200) {
      return {
        success: true,
        data: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to unfollow user',
      };
    }
  } catch (error) {
    console.error('Unfollow user error:', error);
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
};

// 新增：获取关注列表API
export const getFollowing = async (token: string): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for getFollowing');
    return mockGetFollowing();
  }
  
  try {
    const response = await fetch(`${BASE_URL}/following`, {
      method: 'GET',
      headers: {
        'x-access-token': token,
      },
    });

    const data = await response.json();

    if (response.status === 200) {
      return {
        success: true,
        data: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch following list',
      };
    }
  } catch (error) {
    console.error('Get following error:', error);
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
};

// 新增：收藏帖子API
export const savePost = async (postId: string, token: string): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for savePost');
    return mockSavePost(postId);
  }
  
  try {
    const response = await fetch(`${BASE_URL}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify({ post_id: postId }),
    });

    const data = await response.json();

    if (response.status === 200) {
      return {
        success: true,
        data: data,
      };
    } else if (response.status === 400) {
      const message = data.message || '';
      if (message.includes('already saved') || message.includes('Post already saved')) {
        return {
          success: false,
          message: 'already_saved',
          data: { already_saved: true }
        };
      }
      return {
        success: false,
        message: data.message || 'post_id is required!',
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to save post',
      };
    }
  } catch (error) {
    console.error('Save post error:', error);
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
};

// 新增：获取收藏列表API
export const getSaves = async (token: string): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for getSaves');
    return mockGetSaves();
  }
  
  try {
    const response = await fetch(`${BASE_URL}/saves`, {
      method: 'GET',
      headers: {
        'x-access-token': token,
      },
    });

    const data = await response.json();

    if (response.status === 200) {
      return {
        success: true,
        data: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch saved posts',
      };
    }
  } catch (error) {
    console.error('Get saves error:', error);
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
};

// 新增：获取指定帖子点赞数API
export const getLikeCount = async (postId: string, token: string): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for getLikeCount');
    return mockGetLikeCount(postId);
  }
  
  try {
    const response = await fetch(`${BASE_URL}/likes?post_id=${postId}`, {
      method: 'GET',
      headers: {
        'x-access-token': token,
      },
    });

    const data = await response.json();

    if (response.status === 200) {
      return {
        success: true,
        data: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch like count',
      };
    }
  } catch (error) {
    console.error('Get like count error:', error);
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
};

// 新增：获取积分API
export const getEnergyPoint = async (token: string): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for getEnergyPoint');
    return mockGetEnergyPoint();
  }
  
  try {
    const response = await fetch(`${BASE_URL}/energy_point`, {
      method: 'GET',
      headers: {
        'x-access-token': token,
      },
    });

    const data = await response.json();

    if (response.status === 200) {
      return {
        success: true,
        data: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch energy point',
      };
    }
  } catch (error) {
    console.error('Get energy point error:', error);
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
};

// 新增：评论点赞API
export const likeComment = async (commentId: string, token: string): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for likeComment');
    return mockLikeComment(commentId);
  }
  
  try {
    const response = await fetch(`${BASE_URL}/comment_like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify({ comments_id: commentId }),
    });

    // JSON容错处理
    let data: any = null;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.warn('Response is not valid JSON:', jsonError);
    }
    
    console.log('=== likeComment API Debug ===');
    console.log('Request body:', { comments_id: commentId });
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    console.log('========================');

    // 宽松成功判定
    if (response.ok) { // 200-299都算成功
      return {
        success: true,
        data: data,
        message: data?.message || 'Comment liked successfully.',
      };
    }

    // 特殊处理"已点赞"情况
    const msg = (data?.message || '').toLowerCase();
    if ((response.status === 400 || response.status === 409) && 
        (msg.includes('already') || msg.includes('liked'))) {
      return {
        success: false,
        message: 'already_liked',
        data: { already_liked: true }
      };
    }

    // 其他错误
    return {
      success: false,
      message: data?.message || `HTTP ${response.status}`,
    };
  } catch (error) {
    console.error('Like comment error:', error);
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
};

// 添加Mock函数
const mockLikeComment = async (commentId: string): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { 
    success: true, 
    data: { message: "Comment liked successfully." } 
  };
};

// 新增：获取用户点赞列表API
export const getUserLikes = async (token: string): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    console.log('🔧 Using Mock API for getUserLikes');
    return { success: true, data: { likes: [] } };
  }
  
  try {
    const response = await fetch(`${BASE_URL}/likes`, {
      method: 'GET',
      headers: {
        'x-access-token': token,
      },
    });

    const data = await response.json();

    if (response.status === 200) {
      return {
        success: true,
        data: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch user likes',
      };
    }
  } catch (error) {
    console.error('Get user likes error:', error);
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
};

// 更新getSaves函数的导出（已存在）
// export const getSaves = async (token: string): Promise<ApiResponse<any>> => {
//   // ... 已存在的代码
// };

