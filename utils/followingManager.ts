import AsyncStorage from '@react-native-async-storage/async-storage';

const FOLLOWING_KEY = 'following_users';

class FollowingManager {
  private followingUsers: Set<string> = new Set();
  private initialized: boolean = false;

  // 初始化，从 AsyncStorage 加载数据
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const data = await AsyncStorage.getItem(FOLLOWING_KEY);
      if (data) {
        this.followingUsers = new Set(JSON.parse(data));
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize FollowingManager:', error);
    }
  }

  // 检查是否关注了某个用户
  isFollowing(userId: string): boolean {
    return this.followingUsers.has(userId);
  }

  // 关注用户
  async addFollowing(userId: string): Promise<void> {
    this.followingUsers.add(userId);
    await this.saveFollowingList();
  }

  // 取消关注
  async removeFollowing(userId: string): Promise<void> {
    this.followingUsers.delete(userId);
    await this.saveFollowingList();
  }

  // 切换关注状态
  async toggleFollowing(userId: string): Promise<boolean> {
    if (this.isFollowing(userId)) {
      await this.removeFollowing(userId);
      return false;
    } else {
      await this.addFollowing(userId);
      return true;
    }
  }

  // 获取关注列表
  getFollowingList(token?: string): Promise<string[]> {
    // 如果需要从服务器获取，可以在这里实现
    return Promise.resolve(Array.from(this.followingUsers));
  }

  // 获取关注数量
  getFollowingCount(): number {
    return this.followingUsers.size;
  }

  // 保存关注列表到 AsyncStorage
  private async saveFollowingList(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        FOLLOWING_KEY,
        JSON.stringify(Array.from(this.followingUsers))
      );
    } catch (error) {
      console.error('Failed to save following list:', error);
    }
  }

  // 批量设置关注列表（从服务器同步时使用）
  async setFollowingList(userIds: string[]): Promise<void> {
    this.followingUsers = new Set(userIds);
    await this.saveFollowingList();
  }

  // 清除所有关注数据
  async clearAll(): Promise<void> {
    this.followingUsers.clear();
    await AsyncStorage.removeItem(FOLLOWING_KEY);
  }
}

// 导出单例实例
export const followingManager = new FollowingManager();
