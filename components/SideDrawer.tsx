import { router } from 'expo-router';
import React from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.8;

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: {
    id: string;
    username: string;
    real_name?: string;
    avatar?: string;
  };
}

export default function SideDrawer({ isOpen, onClose, userProfile }: SideDrawerProps) {
  const [slideAnim] = React.useState(new Animated.Value(-DRAWER_WIDTH));
  const [shouldRender, setShouldRender] = React.useState(isOpen);
  const [isNavigating, setIsNavigating] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsNavigating(false); // 重置导航状态
    }
    
    Animated.timing(slideAnim, {
      toValue: isOpen ? 0 : -DRAWER_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (!isOpen) {
        setShouldRender(false);
      }
    });
  }, [isOpen]);

  const handleMenuPress = (route: string) => {
    if (isNavigating) return; // 如果正在导航，直接返回
    
    setIsNavigating(true);
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 300);
  };

  const handleLogout = () => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    onClose();
    setTimeout(() => {
      router.push('/login');
    }, 300);
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <>
      {/* 背景遮罩 */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: slideAnim.interpolate({
                inputRange: [-DRAWER_WIDTH, 0],
                outputRange: [0, 1],
              }),
            },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* 侧边栏 */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <ScrollView style={styles.drawerContent} showsVerticalScrollIndicator={false}>
          {/* 用户信息区域 - 简约白色背景 */}
          <View style={styles.profileSection}>
            <View style={styles.profileHeader}>
              <View style={styles.profileInfo}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {userProfile.username[0].toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.userTextInfo}>
                  <Text style={styles.username}>{userProfile.username}</Text>
                  <Text style={styles.userId}>用户ID: 12345678</Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => handleMenuPress('/edit-profile')}
                style={styles.editButton}
                activeOpacity={0.7}
              >
                <Image
                  source={require('@/assets/images/edit_profile.png')}
                  style={styles.editIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 菜单项区域 */}
          <View style={styles.menuContainer}>
            {/* 我的收藏 */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuPress('/my-favorites')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Image
                    source={require('@/assets/images/my_save.png')}
                    style={styles.menuIcon}
                  />
                </View>
                <Text style={styles.menuText}>我的收藏</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            {/* 发送记录 */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuPress('/previous-posts')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Image
                    source={require('@/assets/images/previous_post.png')}
                    style={styles.menuIcon}
                  />
                </View>
                <Text style={styles.menuText}>发送记录</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            {/* 精力兑换 */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuPress('/energy-exchange')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Text style={styles.energyEmoji}>⚡</Text>
                </View>
                <Text style={styles.menuText}>精力兑换</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            {/* 分隔线 */}
            <View style={styles.divider} />

            {/* 通用 */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuPress('/general-settings')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Image
                    source={require('@/assets/images/general_settings.png')}
                    style={styles.menuIcon}
                  />
                </View>
                <Text style={styles.menuText}>通用</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            {/* 帮助与支持 */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuPress('/help-support')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Image
                    source={require('@/assets/images/help_support.png')}
                    style={styles.menuIcon}
                  />
                </View>
                <Text style={styles.menuText}>帮助与支持</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            {/* 隐私政策 */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuPress('/privacy-policy')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Image
                    source={require('@/assets/images/privacy_notice.png')}
                    style={styles.menuIcon}
                  />
                </View>
                <Text style={styles.menuText}>隐私政策</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            {/* 使用规范 */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuPress('/terms-of-service')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Image
                    source={require('@/assets/images/term_of_use.png')}
                    style={styles.menuIcon}
                  />
                </View>
                <Text style={styles.menuText}>使用规范</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            {/* 退出登录 - 统一样式 */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Image
                    source={require('@/assets/images/switch_account.png')}
                    style={styles.menuIcon}
                  />
                </View>
                <Text style={styles.menuText}>切换账号/退出登录</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 999,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  drawerContent: {
    flex: 1,
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4A90E2',
  },
  userTextInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  userId: {
    fontSize: 13,
    color: '#64748B',
  },
  editButton: {
    padding: 8,
  },
  editIcon: {
    width: 22,
    height: 22,
    tintColor: '#64748B',
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIcon: {
    width: 24,
    height: 24,
  },
  menuText: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '400',
  },
  menuArrow: {
    fontSize: 20,
    color: '#CBD5E1',
  },
  
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
    marginHorizontal: 4,
  },
  energyEmoji: {
    fontSize: 24,
  },
});