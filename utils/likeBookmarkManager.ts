import AsyncStorage from '@react-native-async-storage/async-storage';

const LIKED_POSTS_KEY = 'liked_posts';
const BOOKMARKED_POSTS_KEY = 'bookmarked_posts';

class LikeBookmarkManager {
  private likedPosts: Set<string> = new Set();
  private bookmarkedPosts: Set<string> = new Set();
  private initialized: boolean = false;

  // 初始化，从 AsyncStorage 加载数据
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const [likedData, bookmarkedData] = await Promise.all([
        AsyncStorage.getItem(LIKED_POSTS_KEY),
        AsyncStorage.getItem(BOOKMARKED_POSTS_KEY),
      ]);

      if (likedData) {
        this.likedPosts = new Set(JSON.parse(likedData));
      }

      if (bookmarkedData) {
        this.bookmarkedPosts = new Set(JSON.parse(bookmarkedData));
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize LikeBookmarkManager:', error);
    }
  }

  // 兼容旧方法名
  async initializeStates(token?: string): Promise<void> {
    await this.initialize();
  }

  // 调试信息
  getDebugInfo(): { likedCount: number; bookmarkedCount: number; initialized: boolean } {
    return {
      likedCount: this.likedPosts.size,
      bookmarkedCount: this.bookmarkedPosts.size,
      initialized: this.initialized,
    };
  }

  // 兼容旧方法名 - 添加点赞
  async addLikedPost(postId: string): Promise<void> {
    await this.likePost(postId);
  }

  // 兼容旧方法名 - 移除点赞
  async removeLikedPost(postId: string): Promise<void> {
    await this.unlikePost(postId);
  }

  // 兼容旧方法名 - 添加收藏
  async addBookmarkedPost(postId: string): Promise<void> {
    await this.bookmarkPost(postId);
  }

  // 兼容旧方法名 - 移除收藏
  async removeBookmarkedPost(postId: string): Promise<void> {
    await this.unbookmarkPost(postId);
  }

  // 检查帖子是否已点赞
  isLiked(postId: string): boolean {
    return this.likedPosts.has(postId);
  }

  // 检查帖子是否已收藏
  isBookmarked(postId: string): boolean {
    return this.bookmarkedPosts.has(postId);
  }

  // 点赞帖子
  async likePost(postId: string): Promise<void> {
    this.likedPosts.add(postId);
    await this.saveLikedPosts();
  }

  // 取消点赞
  async unlikePost(postId: string): Promise<void> {
    this.likedPosts.delete(postId);
    await this.saveLikedPosts();
  }

  // 切换点赞状态
  async toggleLike(postId: string): Promise<boolean> {
    if (this.isLiked(postId)) {
      await this.unlikePost(postId);
      return false;
    } else {
      await this.likePost(postId);
      return true;
    }
  }

  // 收藏帖子
  async bookmarkPost(postId: string): Promise<void> {
    this.bookmarkedPosts.add(postId);
    await this.saveBookmarkedPosts();
  }

  // 取消收藏
  async unbookmarkPost(postId: string): Promise<void> {
    this.bookmarkedPosts.delete(postId);
    await this.saveBookmarkedPosts();
  }

  // 切换收藏状态
  async toggleBookmark(postId: string): Promise<boolean> {
    if (this.isBookmarked(postId)) {
      await this.unbookmarkPost(postId);
      return false;
    } else {
      await this.bookmarkPost(postId);
      return true;
    }
  }

  // 获取所有已点赞的帖子 ID
  getLikedPosts(): string[] {
    return Array.from(this.likedPosts);
  }

  // 获取所有已收藏的帖子 ID
  getBookmarkedPosts(): string[] {
    return Array.from(this.bookmarkedPosts);
  }

  // 保存点赞数据到 AsyncStorage
  private async saveLikedPosts(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        LIKED_POSTS_KEY,
        JSON.stringify(Array.from(this.likedPosts))
      );
    } catch (error) {
      console.error('Failed to save liked posts:', error);
    }
  }

  // 保存收藏数据到 AsyncStorage
  private async saveBookmarkedPosts(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        BOOKMARKED_POSTS_KEY,
        JSON.stringify(Array.from(this.bookmarkedPosts))
      );
    } catch (error) {
      console.error('Failed to save bookmarked posts:', error);
    }
  }

  // 清除所有数据
  async clearAll(): Promise<void> {
    this.likedPosts.clear();
    this.bookmarkedPosts.clear();
    await Promise.all([
      AsyncStorage.removeItem(LIKED_POSTS_KEY),
      AsyncStorage.removeItem(BOOKMARKED_POSTS_KEY),
    ]);
  }
}

// 导出单例实例
export const likeBookmarkManager = new LikeBookmarkManager();
