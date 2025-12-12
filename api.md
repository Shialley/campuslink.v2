# CampusLink API 接口文档

> **版本**: v1.0  
> **基础 URL**: `https://api.campusinone.com/v1`  
> **更新日期**: 2024-12-13

---

## 📋 目录

- [概述](#概述)
- [认证方式](#认证方式)
- [接口分类](#接口分类)
  - [1. 认证相关](#1-认证相关)
  - [2. 帖子管理](#2-帖子管理)
  - [3. 评论管理](#3-评论管理)
  - [4. 用户相关](#4-用户相关)
  - [5. 社交功能](#5-社交功能)
  - [6. 消息通知](#6-消息通知)
  - [7. 能量积分](#7-能量积分)
  - [8. 图片管理](#8-图片管理)
- [数据模型](#数据模型)
- [错误处理](#错误处理)
- [Mock 模式](#mock-模式)

---

## 概述

CampusLink API 提供了完整的校园社交平台功能，包括帖子发布、评论互动、用户管理、能量积分系统等。

### 接口统计

| 分类 | 接口数量 |
|------|---------|
| 认证相关 | 3 |
| 帖子管理 | 5 |
| 评论管理 | 3 |
| 用户相关 | 3 |
| 社交功能 | 6 |
| 消息通知 | 5 |
| 能量积分 | 5 |
| 图片管理 | 4 |
| **总计** | **34** |

---

## 认证方式

所有需要认证的接口使用 JWT Token 认证：

```typescript
headers: {
  'Content-Type': 'application/json',
  'x-access-token': 'YOUR_JWT_TOKEN'
}
```

---

## 接口分类

### 1. 认证相关

#### 1.1 用户登录

**接口**: `POST /login`  
**功能**: 用户登录获取 Token  
**需要认证**: ❌

**请求参数**:
```typescript
{
  email: string;      // 邮箱
  password: string;   // 密码
}
```

**响应示例**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": "123",
      "username": "test",
      "email": "test@hku.com"
    }
  }
}
```

**Mock**: ✅  
**实现函数**: `loginUser(loginData: LoginRequest)`

---

#### 1.2 用户注册

**接口**: `POST /register`  
**功能**: 新用户注册  
**需要认证**: ❌

**请求参数**:
```typescript
{
  username: string;   // 用户名
  password: string;   // 密码
  email: string;      // 邮箱
  langs?: string;     // 语言（可选，默认 zh-cn）
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "Verification email sent.",
  "data": {
    "message": "Registration successful"
  }
}
```

**Mock**: ✅  
**实现函数**: `registerUser(registerData: RegisterRequest)`

---

#### 1.3 修改密码

**接口**: `POST /change-password`  
**功能**: 修改用户密码  
**需要认证**: ✅

**请求参数**:
```typescript
{
  oldPassword: string;  // 旧密码
  newPassword: string;  // 新密码
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Mock**: ✅  
**实现函数**: `changePassword(oldPassword: string, newPassword: string, token: string)`

---

### 2. 帖子管理

#### 2.1 获取帖子列表

**接口**: `GET /get_posts`  
**功能**: 获取帖子列表，支持分页和标签过滤  
**需要认证**: ✅

**查询参数**:
- `page`: number（页码，默认1）
- `tags`: string（标签过滤，可选）

**请求示例**:
```
GET /get_posts?page=1&tags=CUHK
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "postid": "1",
        "title": "测试帖子",
        "content": "这是帖子内容",
        "cover_name": "test",
        "createtime": "2024-01-01T00:00:00Z",
        "like": 5,
        "comments": 3,
        "bookmarks": 2,
        "tags": "CUHK,Study",
        "hotness": 50,
        "image_url": null
      }
    ],
    "page": 1,
    "total_pages": 10,
    "total_posts": 95
  }
}
```

**Mock**: ✅  
**实现函数**: `getPosts(page: number, token: string, tagFilter?: string)`

---

#### 2.2 获取单个帖子详情

**接口**: `GET /get_post`  
**功能**: 获取指定帖子的详细信息及评论  
**需要认证**: ✅

**查询参数**:
- `postid`: string（帖子ID）

**请求示例**:
```
GET /get_post?postid=123
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "post": {
      "postid": "123",
      "title": "帖子标题",
      "content": "帖子内容",
      "cover_name": "author",
      "createtime": "2024-01-01T00:00:00Z",
      "like": 10,
      "comments": 5,
      "tags": "CUHK",
      "image_url": "image-key.jpg"
    },
    "comments": [
      {
        "commetsid": "1",
        "postid": "123",
        "content": "评论内容",
        "covername": "commenter",
        "create_time": "2024-01-01T01:00:00Z",
        "likes_count": 2,
        "ref": null
      }
    ]
  }
}
```

**Mock**: ✅  
**实现函数**: `getPost(postid: string, token: string)`

---

#### 2.3 发表帖子

**接口**: `POST /send_post`  
**功能**: 创建新帖子（普通或定向）  
**需要认证**: ✅

**请求参数**:
```typescript
{
  title: string;              // 标题（必填）
  content: string;            // 内容
  image_url?: string;         // 图片key（可选）
  ref?: string;               // 引用ID（可选）
  real_name: boolean;         // 是否实名
  tags?: string;              // 标签（逗号分隔）
  type?: 'normal' | 'targeted'; // 类型（默认 normal）
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "post_id": "new-post-123",
    "message": "Post created successfully!",
    "type": "normal"
  }
}
```

**Mock**: ✅  
**实现函数**: `sendPost(postData: PostData, token: string)`

---

#### 2.4 获取用户发布的帖子

**接口**: `GET /get_user_posts`  
**功能**: 获取当前用户发布的所有帖子  
**需要认证**: ✅

**查询参数**:
- `page`: number（页码，默认1）

**响应示例**:
```json
{
  "success": true,
  "data": {
    "posts": [...],
    "page": 1,
    "total_pages": 3,
    "message": "Posts retrieved successfully"
  }
}
```

**Mock**: ✅  
**实现函数**: `getUserPosts(page: number, token: string)`

---

#### 2.5 点赞帖子

**接口**: `POST /like`  
**功能**: 对帖子进行点赞  
**需要认证**: ✅

**请求参数**:
```typescript
{
  post_id: string;  // 或 postid
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "Post liked successfully"
}
```

**特殊状态**:
- 已点赞时返回: `{ "success": false, "message": "already_liked" }`

**Mock**: ✅  
**实现函数**: `likePost(postId: string, token: string)`

---

### 3. 评论管理

#### 3.1 发表评论

**接口**: `POST /send_comments`  
**功能**: 对帖子发表评论或回复其他评论  
**需要认证**: ✅

**请求参数**:
```typescript
{
  postid: string;      // 帖子ID
  content: string;     // 评论内容
  real_name?: boolean; // 是否实名（可选）
  ref?: string;        // 回复的评论ID（可选）
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "message": "Comment added successfully.",
    "comment_id": "comment-456"
  }
}
```

**Mock**: ✅  
**实现函数**: `sendComment(commentData: CommentData, token: string)`

---

#### 3.2 点赞评论

**接口**: `POST /comment_like`  
**功能**: 对评论进行点赞  
**需要认证**: ✅

**请求参数**:
```typescript
{
  comments_id: string;  // 评论ID
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "Comment liked successfully"
}
```

**特殊状态**:
- 已点赞时返回: `{ "success": false, "message": "already_liked" }`

**Mock**: ✅  
**实现函数**: `likeComment(commentId: string, token: string)`

---

#### 3.3 获取评论通知

**接口**: `GET /get_comment_notifications`  
**功能**: 获取用户的评论通知列表  
**需要认证**: ✅

**响应示例**:
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-1",
        "type": "comment",
        "post_id": "123",
        "comment_id": "456",
        "from_user": "alice",
        "content": "回复了你的帖子",
        "created_at": "2024-01-01T00:00:00Z",
        "is_read": false
      }
    ]
  }
}
```

**Mock**: ✅  
**实现函数**: `getCommentNotifications(token: string)`

---

### 4. 用户相关

#### 4.1 获取用户信息

**接口**: `GET /get_user_profile`  
**功能**: 获取当前登录用户的个人信息  
**需要认证**: ✅

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "123",
    "username": "test",
    "email": "test@hku.com",
    "real_name": "张三",
    "avatar": "avatar-key.jpg",
    "school": "香港大学",
    "type": "student",
    "major": "计算机科学",
    "institution": "工程学院",
    "introduction": "个人简介",
    "verification": "verified"
  }
}
```

**Mock**: ✅  
**实现函数**: `getUserProfile(token: string)`

---

#### 4.2 更新用户信息

**接口**: `PUT /update_user_profile`  
**功能**: 更新用户个人信息  
**需要认证**: ✅

**请求参数**:
```typescript
{
  real_name?: string;
  avatar?: string;
  school?: string;
  type?: string;
  major?: string;
  institution?: string;
  introduction?: string;
  // 支持部分更新
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "message": "Profile updated successfully"
  }
}
```

**Mock**: ✅  
**实现函数**: `updateUserProfile(profileData: Partial<UserProfile>, token: string)`

---

#### 4.3 获取用户点赞列表

**接口**: `GET /likes`  
**功能**: 获取用户点赞过的所有帖子  
**需要认证**: ✅

**响应示例**:
```json
{
  "success": true,
  "data": {
    "likes": [
      {
        "post_id": "123",
        "liked_at": "2024-01-01T00:00:00Z",
        "post": { /* 帖子详情 */ }
      }
    ]
  }
}
```

**Mock**: ✅  
**实现函数**: `getUserLikes(token: string)`

---

### 5. 社交功能

#### 5.1 关注用户

**接口**: `POST /follow`  
**功能**: 关注其他用户  
**需要认证**: ✅

**请求参数**:
```typescript
{
  followed_id: string;  // 被关注用户ID
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "User followed successfully"
}
```

**特殊状态**:
- 已关注时返回: `{ "success": false, "message": "already_followed" }`

**Mock**: ✅  
**实现函数**: `followUser(followedId: string, token: string)`

---

#### 5.2 取消关注

**接口**: `POST /unfollow`  
**功能**: 取消关注用户  
**需要认证**: ✅

**请求参数**:
```typescript
{
  followed_id: string;  // 取消关注的用户ID
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "User unfollowed successfully"
}
```

**Mock**: ✅  
**实现函数**: `unfollowUser(followedId: string, token: string)`

---

#### 5.3 获取关注列表

**接口**: `GET /following`  
**功能**: 获取当前用户关注的所有用户  
**需要认证**: ✅

**响应示例**:
```json
{
  "success": true,
  "data": {
    "following": [
      {
        "user_id": "456",
        "username": "alice",
        "avatar": "avatar-key.jpg",
        "followed_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

**Mock**: ✅  
**实现函数**: `getFollowing(token: string)`

---

#### 5.4 收藏帖子

**接口**: `POST /save`  
**功能**: 收藏帖子到我的收藏  
**需要认证**: ✅

**请求参数**:
```typescript
{
  post_id: string;  // 帖子ID
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "Post saved successfully"
}
```

**特殊状态**:
- 已收藏时返回: `{ "success": false, "message": "already_saved" }`

**Mock**: ✅  
**实现函数**: `savePost(postId: string, token: string)`

---

#### 5.5 获取收藏列表

**接口**: `GET /saves`  
**功能**: 获取用户收藏的所有帖子  
**需要认证**: ✅

**响应示例**:
```json
{
  "success": true,
  "data": {
    "saves": [
      {
        "post_id": "123",
        "saved_at": "2024-01-01T00:00:00Z",
        "post": {
          "postid": "123",
          "title": "帖子标题",
          "content": "帖子内容",
          "cover_name": "author",
          "createtime": "2024-01-01T00:00:00Z",
          "image_url": "image-key.jpg"
        }
      }
    ]
  }
}
```

**Mock**: ✅  
**实现函数**: `getSaves(token: string)`

---

#### 5.6 获取帖子点赞数

**接口**: `GET /likes`  
**功能**: 获取指定帖子的点赞数量  
**需要认证**: ✅

**查询参数**:
- `post_id`: string（帖子ID）

**请求示例**:
```
GET /likes?post_id=123
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "post_id": "123",
    "like_count": 25
  }
}
```

**Mock**: ✅  
**实现函数**: `getLikeCount(postId: string, token: string)`

---

### 6. 消息通知

#### 6.1 获取私信列表

**接口**: `GET /get_direct_messages`  
**功能**: 获取用户的所有私信  
**需要认证**: ✅

**响应示例**:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg-1",
        "from_user_id": "456",
        "from_username": "alice",
        "content": "你好",
        "created_at": "2024-01-01T00:00:00Z",
        "is_read": false
      }
    ]
  }
}
```

**Mock**: ✅  
**实现函数**: `getDirectMessages(token: string)`

---

#### 6.2 获取定向消息列表

**接口**: `GET /get_targeted_messages`  
**功能**: 获取系统或管理员发送的定向消息  
**需要认证**: ✅

**响应示例**:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "tmsg-1",
        "type": "system",
        "title": "系统通知",
        "content": "欢迎使用 CampusLink",
        "created_at": "2024-01-01T00:00:00Z",
        "is_read": true
      }
    ]
  }
}
```

**Mock**: ✅  
**实现函数**: `getTargetedMessages(token: string)`

---

#### 6.3 发送私信

**接口**: `POST /send_direct_message`  
**功能**: 向其他用户发送私信  
**需要认证**: ✅

**请求参数**:
```typescript
{
  recipient_id: string;  // 接收者ID
  content: string;       // 消息内容
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "message_id": "msg-789",
    "message": "Message sent successfully"
  }
}
```

**Mock**: ✅  
**实现函数**: `sendDirectMessage(recipientId: string, content: string, token: string)`

---

#### 6.4 标记消息已读

**接口**: `POST /mark_message_read`  
**功能**: 将消息标记为已读状态  
**需要认证**: ✅

**请求参数**:
```typescript
{
  message_id: string;  // 消息ID
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "Message marked as read"
}
```

**Mock**: ✅  
**实现函数**: `markMessageAsRead(messageId: string, token: string)`

---

#### 6.5 书签帖子（已弃用）

**接口**: ~~`POST /bookmark`~~  
**状态**: ⚠️ 已弃用，请使用 `/save` 接口  
**实现函数**: `bookmarkPost(postId: string, token: string)`

---

### 7. 能量积分

#### 7.1 获取能量积分

**接口**: `GET /energy_point`  
**功能**: 获取当前用户的能量积分总额  
**需要认证**: ✅

**响应示例**:
```json
{
  "success": true,
  "data": {
    "user_id": "123",
    "total_points": 1250,
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Mock**: ✅  
**实现函数**: `getEnergyPoint(token: string)`

---

#### 7.2 增加能量积分

**接口**: `POST /energy_point_add`  
**功能**: 完成任务后增加能量积分  
**需要认证**: ✅

**请求参数**:
```typescript
{
  post_id: string;  // 关联的帖子ID
  score: number;    // 增加的分数
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "message": "Energy points added successfully",
    "new_total": 1300,
    "added_points": 50
  }
}
```

**Mock**: ✅  
**实现函数**: `addEnergyPoint(postId: string, score: number, token: string)`

---

#### 7.3 兑换礼物

**接口**: `POST /energy_point_redeem`  
**功能**: 使用能量积分兑换礼物  
**需要认证**: ✅

**请求参数**:
```typescript
{
  id: number;  // 礼物ID
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "message": "Gift redeemed successfully",
    "gift_name": "校园周边",
    "points_used": 500,
    "remaining_points": 750
  }
}
```

**Mock**: ✅  
**实现函数**: `redeemGift(giftId: number, token: string)`

---

#### 7.4 获取礼物列表

**接口**: `GET /gift_list`  
**功能**: 获取所有可兑换的礼物列表  
**需要认证**: ✅

**响应示例**:
```json
{
  "success": true,
  "data": {
    "gifts": [
      {
        "id": 1,
        "name": "校园周边",
        "price": 500,
        "left_number": 10,
        "description": "精美周边产品",
        "image_url": "gift-1.jpg"
      },
      {
        "id": 2,
        "name": "咖啡券",
        "price": 200,
        "left_number": 50,
        "description": "校园咖啡厅通用券",
        "image_url": "gift-2.jpg"
      }
    ]
  }
}
```

**Mock**: ✅  
**实现函数**: `getGiftList(token: string)`

---

#### 7.5 获取能量积分历史

**接口**: `GET /energy_point_history`  
**功能**: 获取能量积分交易历史记录  
**需要认证**: ✅

**查询参数**:
- `page`: number（页码，默认1）

**请求示例**:
```
GET /energy_point_history?page=1
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "hist-1",
        "type": "earn",
        "amount": 50,
        "reason": "完成帖子阅读",
        "post_id": "123",
        "created_at": "2024-01-01T00:00:00Z"
      },
      {
        "id": "hist-2",
        "type": "redeem",
        "amount": -200,
        "reason": "兑换咖啡券",
        "gift_id": 2,
        "created_at": "2024-01-02T00:00:00Z"
      }
    ],
    "page": 1,
    "total_pages": 5
  }
}
```

**Mock**: ✅  
**实现函数**: `getEnergyHistory(page: number, token: string)`

---

### 8. 图片管理

#### 8.1 上传图片

**接口**: `POST /upload_image`  
**功能**: 上传图片文件到服务器  
**需要认证**: ✅  
**Content-Type**: `multipart/form-data`

**请求参数**:
```typescript
FormData: {
  file: Blob | File | URI  // 图片文件
}
```

**平台适配**:
- **Web**: 使用 Blob 对象
- **Mobile**: 使用 URI 字符串

**响应示例**:
```json
{
  "success": true,
  "data": {
    "message": "Image uploaded successfully!",
    "key": "uploads/user-123/image-1704067200000.jpg"
  }
}
```

**Mock**: ✅  
**实现函数**: `uploadImage(imageUri: string, token: string)`

**使用示例**:
```typescript
// Web
const blob = await fetch(imageUri).then(r => r.blob());
const result = await uploadImage(imageUri, token);

// Mobile
const result = await uploadImage(fileUri, token);
```

---

#### 8.2 批量上传图片

**功能**: 批量上传多张图片（辅助函数）  
**需要认证**: ✅

**实现函数**: `uploadImages(imageUris: string[], token: string)`

**返回**: `Promise<string[]>` - 图片 key 数组

**使用示例**:
```typescript
const imageKeys = await uploadImages(
  ['file:///path1.jpg', 'file:///path2.jpg'],
  token
);
// 返回: ['key1.jpg', 'key2.jpg']
```

---

#### 8.3 获取图片

**接口**: `GET /get_image/{key}`  
**功能**: 通过 // filepath: d:\campuslink.v2\docs\API_DOCUMENTATION.md
# CampusLink API 接口文档

> **版本**: v1.0  
> **基础 URL**: `https://api.campusinone.com/v1`  
> **更新日期**: 2024-12-13

---

## 📋 目录

- [概述](#概述)
- [认证方式](#认证方式)
- [接口分类](#接口分类)
  - [1. 认证相关](#1-认证相关)
  - [2. 帖子管理](#2-帖子管理)
  - [3. 评论管理](#3-评论管理)
  - [4. 用户相关](#4-用户相关)
  - [5. 社交功能](#5-社交功能)
  - [6. 消息通知](#6-消息通知)
  - [7. 能量积分](#7-能量积分)
  - [8. 图片管理](#8-图片管理)
- [数据模型](#数据模型)
- [错误处理](#错误处理)
- [Mock 模式](#mock-模式)

---

## 概述

CampusLink API 提供了完整的校园社交平台功能，包括帖子发布、评论互动、用户管理、能量积分系统等。

### 接口统计

| 分类 | 接口数量 |
|------|---------|
| 认证相关 | 3 |
| 帖子管理 | 5 |
| 评论管理 | 3 |
| 用户相关 | 3 |
| 社交功能 | 6 |
| 消息通知 | 5 |
| 能量积分 | 5 |
| 图片管理 | 4 |
| **总计** | **34** |

---

## 认证方式

所有需要认证的接口使用 JWT Token 认证：

```typescript
headers: {
  'Content-Type': 'application/json',
  'x-access-token': 'YOUR_JWT_TOKEN'
}
```

---

## 接口分类

### 1. 认证相关

#### 1.1 用户登录

**接口**: `POST /login`  
**功能**: 用户登录获取 Token  
**需要认证**: ❌

**请求参数**:
```typescript
{
  email: string;      // 邮箱
  password: string;   // 密码
}
```

**响应示例**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": "123",
      "username": "test",
      "email": "test@hku.com"
    }
  }
}
```

**Mock**: ✅  
**实现函数**: `loginUser(loginData: LoginRequest)`

---

#### 1.2 用户注册

**接口**: `POST /register`  
**功能**: 新用户注册  
**需要认证**: ❌

**请求参数**:
```typescript
{
  username: string;   // 用户名
  password: string;   // 密码
  email: string;      // 邮箱
  langs?: string;     // 语言（可选，默认 zh-cn）
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "Verification email sent.",
  "data": {
    "message": "Registration successful"
  }
}
```

**Mock**: ✅  
**实现函数**: `registerUser(registerData: RegisterRequest)`

---

#### 1.3 修改密码

**接口**: `POST /change-password`  
**功能**: 修改用户密码  
**需要认证**: ✅

**请求参数**:
```typescript
{
  oldPassword: string;  // 旧密码
  newPassword: string;  // 新密码
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Mock**: ✅  
**实现函数**: `changePassword(oldPassword: string, newPassword: string, token: string)`

---

### 2. 帖子管理

#### 2.1 获取帖子列表

**接口**: `GET /get_posts`  
**功能**: 获取帖子列表，支持分页和标签过滤  
**需要认证**: ✅

**查询参数**:
- `page`: number（页码，默认1）
- `tags`: string（标签过滤，可选）

**请求示例**:
```
GET /get_posts?page=1&tags=CUHK
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "postid": "1",
        "title": "测试帖子",
        "content": "这是帖子内容",
        "cover_name": "test",
        "createtime": "2024-01-01T00:00:00Z",
        "like": 5,
        "comments": 3,
        "bookmarks": 2,
        "tags": "CUHK,Study",
        "hotness": 50,
        "image_url": null
      }
    ],
    "page": 1,
    "total_pages": 10,
    "total_posts": 95
  }
}
```

**Mock**: ✅  
**实现函数**: `getPosts(page: number, token: string, tagFilter?: string)`

---

#### 2.2 获取单个帖子详情

**接口**: `GET /get_post`  
**功能**: 获取指定帖子的详细信息及评论  
**需要认证**: ✅

**查询参数**:
- `postid`: string（帖子ID）

**请求示例**:
```
GET /get_post?postid=123
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "post": {
      "postid": "123",
      "title": "帖子标题",
      "content": "帖子内容",
      "cover_name": "author",
      "createtime": "2024-01-01T00:00:00Z",
      "like": 10,
      "comments": 5,
      "tags": "CUHK",
      "image_url": "image-key.jpg"
    },
    "comments": [
      {
        "commetsid": "1",
        "postid": "123",
        "content": "评论内容",
        "covername": "commenter",
        "create_time": "2024-01-01T01:00:00Z",
        "likes_count": 2,
        "ref": null
      }
    ]
  }
}
```

**Mock**: ✅  
**实现函数**: `getPost(postid: string, token: string)`

---

#### 2.3 发表帖子

**接口**: `POST /send_post`  
**功能**: 创建新帖子（普通或定向）  
**需要认证**: ✅

**请求参数**:
```typescript
{
  title: string;              // 标题（必填）
  content: string;            // 内容
  image_url?: string;         // 图片key（可选）
  ref?: string;               // 引用ID（可选）
  real_name: boolean;         // 是否实名
  tags?: string;              // 标签（逗号分隔）
  type?: 'normal' | 'targeted'; // 类型（默认 normal）
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "post_id": "new-post-123",
    "message": "Post created successfully!",
    "type": "normal"
  }
}
```

**Mock**: ✅  
**实现函数**: `sendPost(postData: PostData, token: string)`

---

#### 2.4 获取用户发布的帖子

**接口**: `GET /get_user_posts`  
**功能**: 获取当前用户发布的所有帖子  
**需要认证**: ✅

**查询参数**:
- `page`: number（页码，默认1）

**响应示例**:
```json
{
  "success": true,
  "data": {
    "posts": [...],
    "page": 1,
    "total_pages": 3,
    "message": "Posts retrieved successfully"
  }
}
```

**Mock**: ✅  
**实现函数**: `getUserPosts(page: number, token: string)`

---

#### 2.5 点赞帖子

**接口**: `POST /like`  
**功能**: 对帖子进行点赞  
**需要认证**: ✅

**请求参数**:
```typescript
{
  post_id: string;  // 或 postid
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "Post liked successfully"
}
```

**特殊状态**:
- 已点赞时返回: `{ "success": false, "message": "already_liked" }`

**Mock**: ✅  
**实现函数**: `likePost(postId: string, token: string)`

---

### 3. 评论管理

#### 3.1 发表评论

**接口**: `POST /send_comments`  
**功能**: 对帖子发表评论或回复其他评论  
**需要认证**: ✅

**请求参数**:
```typescript
{
  postid: string;      // 帖子ID
  content: string;     // 评论内容
  real_name?: boolean; // 是否实名（可选）
  ref?: string;        // 回复的评论ID（可选）
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "message": "Comment added successfully.",
    "comment_id": "comment-456"
  }
}
```

**Mock**: ✅  
**实现函数**: `sendComment(commentData: CommentData, token: string)`

---

#### 3.2 点赞评论

**接口**: `POST /comment_like`  
**功能**: 对评论进行点赞  
**需要认证**: ✅

**请求参数**:
```typescript
{
  comments_id: string;  // 评论ID
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "Comment liked successfully"
}
```

**特殊状态**:
- 已点赞时返回: `{ "success": false, "message": "already_liked" }`

**Mock**: ✅  
**实现函数**: `likeComment(commentId: string, token: string)`

---

#### 3.3 获取评论通知

**接口**: `GET /get_comment_notifications`  
**功能**: 获取用户的评论通知列表  
**需要认证**: ✅

**响应示例**:
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-1",
        "type": "comment",
        "post_id": "123",
        "comment_id": "456",
        "from_user": "alice",
        "content": "回复了你的帖子",
        "created_at": "2024-01-01T00:00:00Z",
        "is_read": false
      }
    ]
  }
}
```

**Mock**: ✅  
**实现函数**: `getCommentNotifications(token: string)`

---

### 4. 用户相关

#### 4.1 获取用户信息

**接口**: `GET /get_user_profile`  
**功能**: 获取当前登录用户的个人信息  
**需要认证**: ✅

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "123",
    "username": "test",
    "email": "test@hku.com",
    "real_name": "张三",
    "avatar": "avatar-key.jpg",
    "school": "香港大学",
    "type": "student",
    "major": "计算机科学",
    "institution": "工程学院",
    "introduction": "个人简介",
    "verification": "verified"
  }
}
```

**Mock**: ✅  
**实现函数**: `getUserProfile(token: string)`

---

#### 4.2 更新用户信息

**接口**: `PUT /update_user_profile`  
**功能**: 更新用户个人信息  
**需要认证**: ✅

**请求参数**:
```typescript
{
  real_name?: string;
  avatar?: string;
  school?: string;
  type?: string;
  major?: string;
  institution?: string;
  introduction?: string;
  // 支持部分更新
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "message": "Profile updated successfully"
  }
}
```

**Mock**: ✅  
**实现函数**: `updateUserProfile(profileData: Partial<UserProfile>, token: string)`

---

#### 4.3 获取用户点赞列表

**接口**: `GET /likes`  
**功能**: 获取用户点赞过的所有帖子  
**需要认证**: ✅

**响应示例**:
```json
{
  "success": true,
  "data": {
    "likes": [
      {
        "post_id": "123",
        "liked_at": "2024-01-01T00:00:00Z",
        "post": { /* 帖子详情 */ }
      }
    ]
  }
}
```

**Mock**: ✅  
**实现函数**: `getUserLikes(token: string)`

---

### 5. 社交功能

#### 5.1 关注用户

**接口**: `POST /follow`  
**功能**: 关注其他用户  
**需要认证**: ✅

**请求参数**:
```typescript
{
  followed_id: string;  // 被关注用户ID
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "User followed successfully"
}
```

**特殊状态**:
- 已关注时返回: `{ "success": false, "message": "already_followed" }`

**Mock**: ✅  
**实现函数**: `followUser(followedId: string, token: string)`

---

#### 5.2 取消关注

**接口**: `POST /unfollow`  
**功能**: 取消关注用户  
**需要认证**: ✅

**请求参数**:
```typescript
{
  followed_id: string;  // 取消关注的用户ID
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "User unfollowed successfully"
}
```

**Mock**: ✅  
**实现函数**: `unfollowUser(followedId: string, token: string)`

---

#### 5.3 获取关注列表

**接口**: `GET /following`  
**功能**: 获取当前用户关注的所有用户  
**需要认证**: ✅

**响应示例**:
```json
{
  "success": true,
  "data": {
    "following": [
      {
        "user_id": "456",
        "username": "alice",
        "avatar": "avatar-key.jpg",
        "followed_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

**Mock**: ✅  
**实现函数**: `getFollowing(token: string)`

---

#### 5.4 收藏帖子

**接口**: `POST /save`  
**功能**: 收藏帖子到我的收藏  
**需要认证**: ✅

**请求参数**:
```typescript
{
  post_id: string;  // 帖子ID
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "Post saved successfully"
}
```

**特殊状态**:
- 已收藏时返回: `{ "success": false, "message": "already_saved" }`

**Mock**: ✅  
**实现函数**: `savePost(postId: string, token: string)`

---

#### 5.5 获取收藏列表

**接口**: `GET /saves`  
**功能**: 获取用户收藏的所有帖子  
**需要认证**: ✅

**响应示例**:
```json
{
  "success": true,
  "data": {
    "saves": [
      {
        "post_id": "123",
        "saved_at": "2024-01-01T00:00:00Z",
        "post": {
          "postid": "123",
          "title": "帖子标题",
          "content": "帖子内容",
          "cover_name": "author",
          "createtime": "2024-01-01T00:00:00Z",
          "image_url": "image-key.jpg"
        }
      }
    ]
  }
}
```

**Mock**: ✅  
**实现函数**: `getSaves(token: string)`

---

#### 5.6 获取帖子点赞数

**接口**: `GET /likes`  
**功能**: 获取指定帖子的点赞数量  
**需要认证**: ✅

**查询参数**:
- `post_id`: string（帖子ID）

**请求示例**:
```
GET /likes?post_id=123
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "post_id": "123",
    "like_count": 25
  }
}
```

**Mock**: ✅  
**实现函数**: `getLikeCount(postId: string, token: string)`

---

### 6. 消息通知

#### 6.1 获取私信列表

**接口**: `GET /get_direct_messages`  
**功能**: 获取用户的所有私信  
**需要认证**: ✅

**响应示例**:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg-1",
        "from_user_id": "456",
        "from_username": "alice",
        "content": "你好",
        "created_at": "2024-01-01T00:00:00Z",
        "is_read": false
      }
    ]
  }
}
```

**Mock**: ✅  
**实现函数**: `getDirectMessages(token: string)`

---

#### 6.2 获取定向消息列表

**接口**: `GET /get_targeted_messages`  
**功能**: 获取系统或管理员发送的定向消息  
**需要认证**: ✅

**响应示例**:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "tmsg-1",
        "type": "system",
        "title": "系统通知",
        "content": "欢迎使用 CampusLink",
        "created_at": "2024-01-01T00:00:00Z",
        "is_read": true
      }
    ]
  }
}
```

**Mock**: ✅  
**实现函数**: `getTargetedMessages(token: string)`

---

#### 6.3 发送私信

**接口**: `POST /send_direct_message`  
**功能**: 向其他用户发送私信  
**需要认证**: ✅

**请求参数**:
```typescript
{
  recipient_id: string;  // 接收者ID
  content: string;       // 消息内容
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "message_id": "msg-789",
    "message": "Message sent successfully"
  }
}
```

**Mock**: ✅  
**实现函数**: `sendDirectMessage(recipientId: string, content: string, token: string)`

---

#### 6.4 标记消息已读

**接口**: `POST /mark_message_read`  
**功能**: 将消息标记为已读状态  
**需要认证**: ✅

**请求参数**:
```typescript
{
  message_id: string;  // 消息ID
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "Message marked as read"
}
```

**Mock**: ✅  
**实现函数**: `markMessageAsRead(messageId: string, token: string)`

---

#### 6.5 书签帖子（已弃用）

**接口**: ~~`POST /bookmark`~~  
**状态**: ⚠️ 已弃用，请使用 `/save` 接口  
**实现函数**: `bookmarkPost(postId: string, token: string)`

---

### 7. 能量积分

#### 7.1 获取能量积分

**接口**: `GET /energy_point`  
**功能**: 获取当前用户的能量积分总额  
**需要认证**: ✅

**响应示例**:
```json
{
  "success": true,
  "data": {
    "user_id": "123",
    "total_points": 1250,
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Mock**: ✅  
**实现函数**: `getEnergyPoint(token: string)`

---

#### 7.2 增加能量积分

**接口**: `POST /energy_point_add`  
**功能**: 完成任务后增加能量积分  
**需要认证**: ✅

**请求参数**:
```typescript
{
  post_id: string;  // 关联的帖子ID
  score: number;    // 增加的分数
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "message": "Energy points added successfully",
    "new_total": 1300,
    "added_points": 50
  }
}
```

**Mock**: ✅  
**实现函数**: `addEnergyPoint(postId: string, score: number, token: string)`

---

#### 7.3 兑换礼物

**接口**: `POST /energy_point_redeem`  
**功能**: 使用能量积分兑换礼物  
**需要认证**: ✅

**请求参数**:
```typescript
{
  id: number;  // 礼物ID
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "message": "Gift redeemed successfully",
    "gift_name": "校园周边",
    "points_used": 500,
    "remaining_points": 750
  }
}
```

**Mock**: ✅  
**实现函数**: `redeemGift(giftId: number, token: string)`

---

#### 7.4 获取礼物列表

**接口**: `GET /gift_list`  
**功能**: 获取所有可兑换的礼物列表  
**需要认证**: ✅

**响应示例**:
```json
{
  "success": true,
  "data": {
    "gifts": [
      {
        "id": 1,
        "name": "校园周边",
        "price": 500,
        "left_number": 10,
        "description": "精美周边产品",
        "image_url": "gift-1.jpg"
      },
      {
        "id": 2,
        "name": "咖啡券",
        "price": 200,
        "left_number": 50,
        "description": "校园咖啡厅通用券",
        "image_url": "gift-2.jpg"
      }
    ]
  }
}
```

**Mock**: ✅  
**实现函数**: `getGiftList(token: string)`

---

#### 7.5 获取能量积分历史

**接口**: `GET /energy_point_history`  
**功能**: 获取能量积分交易历史记录  
**需要认证**: ✅

**查询参数**:
- `page`: number（页码，默认1）

**请求示例**:
```
GET /energy_point_history?page=1
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "hist-1",
        "type": "earn",
        "amount": 50,
        "reason": "完成帖子阅读",
        "post_id": "123",
        "created_at": "2024-01-01T00:00:00Z"
      },
      {
        "id": "hist-2",
        "type": "redeem",
        "amount": -200,
        "reason": "兑换咖啡券",
        "gift_id": 2,
        "created_at": "2024-01-02T00:00:00Z"
      }
    ],
    "page": 1,
    "total_pages": 5
  }
}
```

**Mock**: ✅  
**实现函数**: `getEnergyHistory(page: number, token: string)`

---

### 8. 图片管理

#### 8.1 上传图片

**接口**: `POST /upload_image`  
**功能**: 上传图片文件到服务器  
**需要认证**: ✅  
**Content-Type**: `multipart/form-data`

**请求参数**:
```typescript
FormData: {
  file: Blob | File | URI  // 图片文件
}
```

**平台适配**:
- **Web**: 使用 Blob 对象
- **Mobile**: 使用 URI 字符串

**响应示例**:
```json
{
  "success": true,
  "data": {
    "message": "Image uploaded successfully!",
    "key": "uploads/user-123/image-1704067200000.jpg"
  }
}
```

**Mock**: ✅  
**实现函数**: `uploadImage(imageUri: string, token: string)`

**使用示例**:
```typescript
// Web
const blob = await fetch(imageUri).then(r => r.blob());
const result = await uploadImage(imageUri, token);

// Mobile
const result = await uploadImage(fileUri, token);
```

---

#### 8.2 批量上传图片

**功能**: 批量上传多张图片（辅助函数）  
**需要认证**: ✅

**实现函数**: `uploadImages(imageUris: string[], token: string)`

**返回**: `Promise<string[]>` - 图片 key 数组

**使用示例**:
```typescript
const imageKeys = await uploadImages(
  ['file:///path1.jpg', 'file:///path2.jpg'],
  token
);
// 返回: ['key1.jpg', 'key2.jpg']
```

---

#### 8.3 获取图片

**接口**: `GET /get_image/{key}`  
**功能**: 通过图片 key 获取图片内容  
**需要认证**: ✅

**URL 参数**:
- `key`: string（图片唯一标识）

**请求示例**:
```
GET /get_image/uploads/user-123/image-1704067200000.jpg
```

**响应**: 
- 成功: 返回图片 Blob 数据
- 失败: 返回 null

**Mock**: ❌（直接请求真实资源）  
**实现函数**: `getImage(key: string, token: string)`

**使用示例**:
```typescript
const imageBlob = await getImage('uploads/user-123/image.jpg', token);
if (imageBlob) {
  const imageUrl = URL.createObjectURL(imageBlob);
  // 使用 imageUrl 显示图片
}
```

---

#### 8.4 获取图片 URL

**功能**: 生成图片的完整访问 URL（辅助函数）  
**需要认证**: ⚠️ 可选（通过 query 参数传递）

**实现函数**: `getImageUrl(key: string, token?: string)`

**返回**: `string` - 完整的图片 URL

**使用示例**:
```typescript
// 不带 token
const url = getImageUrl('uploads/user-123/image.jpg');
// 返回: https://api.campusinone.com/v1/get_image/uploads/user-123/image.jpg

// 带 token（用于需要认证的图片）
const url = getImageUrl('uploads/user-123/image.jpg', token);
// 返回: https://api.campusinone.com/v1/get_image/uploads/user-123/image.jpg?token=xxx
```

---

## 数据模型

### ApiResponse<T>

通用 API 响应格式：

```typescript
interface ApiResponse<T> {
  success: boolean;      // 请求是否成功
  data?: T;              // 响应数据（可选）
  message?: string;      // 消息或错误信息（可选）
  token?: string;        // JWT token（登录时返回）
}
```

---

### UserProfile

用户信息数据模型：

```typescript
interface UserProfile {
  id: string;              // 用户ID
  username: string;        // 用户名
  email: string;           // 邮箱
  real_name?: string;      // 真实姓名（可选）
  avatar?: string;         // 头像图片 key（可选）
  school?: string;         // 学校（可选）
  type?: string;           // 用户类型（student/teacher/staff）
  major?: string;          // 专业（可选）
  institution?: string;    // 学院/机构（可选）
  introduction?: string;   // 个人简介（可选）
  verification?: string;   // 认证状态（verified/pending/none）
}
```

---

### PostData

发帖请求数据模型：

```typescript
interface PostData {
  title: string;                    // 标题（必填）
  content: string;                  // 内容（必填）
  image_url?: string;               // 图片 key（可选）
  ref?: string;                     // 引用ID（可选）
  real_name: boolean;               // 是否实名（必填）
  tags?: string;                    // 标签（逗号分隔，可选）
  type?: 'normal' | 'targeted';     // 类型（可选，默认 normal）
}
```

---

### CommentData

评论请求数据模型：

```typescript
interface CommentData {
  postid: string;          // 帖子ID（必填）
  content: string;         // 评论内容（必填）
  real_name?: boolean;     // 是否实名（可选）
  ref?: string;            // 回复的评论ID（可选）
}
```

---

### Gift

礼物数据模型：

```typescript
interface Gift {
  id: number;              // 礼物ID
  name: string;            // 礼物名称
  price: number;           // 兑换所需积分
  left_number?: number;    // 剩余数量（可选）
  description?: string;    // 描述（可选）
  image_url?: string;      // 图片 key（可选）
}
```

---

### LoginRequest

登录请求数据模型：

```typescript
interface LoginRequest {
  email: string;           // 邮箱
  password: string;        // 密码
}
```

---

### RegisterRequest

注册请求数据模型：

```typescript
interface RegisterRequest {
  username: string;        // 用户名
  password: string;        // 密码
  email: string;           // 邮箱
  langs?: string;          // 语言（可选，默认 zh-cn）
}
```

---

### AddEnergyPointRequest

增加能量积分请求数据模型：

```typescript
interface AddEnergyPointRequest {
  post_id: string;         // 关联的帖子ID
  score: number;           // 增加的分数
}
```

---

### RedeemGiftRequest

兑换礼物请求数据模型：

```typescript
interface RedeemGiftRequest {
  id: number;              // 礼物ID
}
```

---

## 错误处理

### 常见错误码

| HTTP 状态码 | 说明 |
|------------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（Token 无效或过期） |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

### 特殊错误消息

某些接口在特定情况下返回特殊的错误消息：

| 消息 | 接口 | 说明 |
|-----|------|------|
| `already_liked` | `/like`, `/comment_like` | 已经点赞过 |
| `already_saved` | `/save` | 已经收藏过 |
| `already_followed` | `/follow` | 已经关注过 |
| `Invalid credentials` | `/login` | 邮箱或密码错误 |
| `Verification email sent` | `/register` | 注册成功，需邮箱验证 |

---

### 错误响应示例

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

```json
{
  "success": false,
  "message": "Post not found"
}
```

---

## Mock 模式

### 开关控制

在 `services/api.ts` 文件中：

```typescript
const USE_MOCK_API = __DEV__ && false; // 第4行
```

- `true`: 启用 Mock 模式（使用本地模拟数据）
- `false`: 使用真实 API

### Mock 数据

所有接口都支持 Mock 模式，Mock 数据定义在 `services/api.ts` 中：

```typescript
// Mock 用户信息
const MOCK_USER_PROFILE: UserProfile = {
  id: "1",
  username: "test",
  email: "test@hku.com",
  // ...
};

// Mock 帖子数据
const MOCK_POSTS = [
  {
    postid: "1",
    title: "测试帖子1",
    content: "这是第一个测试帖子的内容",
    // ...
  },
  // ...
];

// Mock 评论数据
const MOCK_COMMENTS = [
  {
    commetsid: "1",
    postid: "1",
    content: "这是一个测试评论",
    // ...
  },
  // ...
];
```

---

### 测试账号

开发测试使用的账号信息：

```typescript
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
```

---

### Mock 函数实现

每个真实 API 函数都有对应的 Mock 实现，例如：

```typescript
// 真实 API
export const loginUser = async (loginData: LoginRequest): Promise<ApiResponse<any>> => {
  if (USE_MOCK_API) {
    return mockLoginUser(loginData);
  }
  // 真实 API 调用...
};

// Mock 实现
const mockLoginUser = async (loginData: LoginRequest): Promise<ApiResponse<any>> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络延迟
  
  if (loginData.email === TEST_LOGIN_USER.email && 
      loginData.password === TEST_LOGIN_USER.password) {
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
```

---

## 使用示例

### 完整工作流示例

```typescript
import {
  loginUser,
  getPosts,
  getPost,
  sendComment,
  likePost,
  savePost,
  uploadImage,
  sendPost,
  getEnergyPoint,
  addEnergyPoint
} from './services/api';

// 1. 用户登录
const loginResult = await loginUser({
  email: "user@hku.com",
  password: "password123"
});

if (loginResult.success && loginResult.token) {
  const token = loginResult.token;
  
  // 2. 获取帖子列表（带标签过滤）
  const postsResult = await getPosts(1, token, 'CUHK');
  
  // 3. 查看单个帖子
  const postResult = await getPost('123', token);
  
  // 4. 点赞帖子
  await likePost('123', token);
  
  // 5. 收藏帖子
  await savePost('123', token);
  
  // 6. 发表评论
  await sendComment({
    postid: '123',
    content: '很棒的帖子！',
    real_name: true
  }, token);
  
  // 7. 上传图片并发帖
  const uploadResult = await uploadImage(imageUri, token);
  if (uploadResult.success && uploadResult.data?.key) {
    await sendPost({
      title: '我的新帖子',
      content: '帖子内容...',
      image_url: uploadResult.data.key,
      real_name: true,
      tags: 'CUHK,Study',
      type: 'normal'
    }, token);
  }
  
  // 8. 获取能量积分
  const energyResult = await getEnergyPoint(token);
  console.log('当前积分:', energyResult.data?.total_points);
  
  // 9. 增加能量积分
  await addEnergyPoint('123', 50, token);
}
```

---

## 平台适配说明

### 图片上传平台差异

```typescript
if (Platform.OS === 'web') {
  // Web 平台：使用 Blob
  const response = await fetch(imageUri);
  const blob = await response.blob();
  formData.append('file', blob, 'image.jpg');
} else {
  // 移动平台（iOS/Android）：使用 URI
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'image.jpg',
  } as any);
}
```

---

## 注意事项

1. **Token 管理**: 所有需要认证的接口必须在请求头中包含有效的 Token
2. **错误处理**: 建议对所有 API 调用进行 try-catch 错误处理
3. **Mock 模式**: 开发阶段可启用 Mock 模式进行前端开发，无需依赖后端
4. **图片处理**: 上传图片后获得 key，使用 key 来引用图片
5. **特殊状态**: 注意处理 `already_liked`、`already_saved` 等特殊状态
6. **分页加载**: 使用 `page` 参数实现列表的分页加载
7. **标签过滤**: 使用逗号分隔的字符串格式传递标签

---

## 更新日志

### v1.0 (2024-12-13)
- ✅ 完成所有核心接口实现
- ✅ 支持 Mock 模式
- ✅ 添加能量积分系统
- ✅ 支持图片上传和管理
- ✅ 实现社交功能（关注、收藏、点赞）
- ✅ 支持消息通知系统
- ✅ 平台适配（Web + Mobile）

---

## 联系方式

如有问题或建议，请联系开发团队。

**API Base URL**: `https://api.campusinone.com/v1`

---

*文档生成时间: 2024-12-13*