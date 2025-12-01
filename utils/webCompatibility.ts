import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Web 和原生平台的存储适配器
export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        // Web 平台使用 localStorage
        return localStorage.getItem(key);
      } else {
        // 原生平台使用 AsyncStorage
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
    }
  },

  async clear(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.clear();
      } else {
        await AsyncStorage.clear();
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

// 平台检测工具
export const platformUtils = {
  isWeb: Platform.OS === 'web',
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  
  // 获取平台特定的样式
  selectStyle: <T,>(styles: { web?: T; ios?: T; android?: T; default: T }): T => {
    if (Platform.OS === 'web' && styles.web) return styles.web;
    if (Platform.OS === 'ios' && styles.ios) return styles.ios;
    if (Platform.OS === 'android' && styles.android) return styles.android;
    return styles.default;
  },
};
