import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// 导入 CommonHeader 和 API 函数
import CommonHeader from '../components/CommonHeader';
import { getEnergyHistory, getEnergyPoint } from '../services/api';

// 能量交易记录接口
interface EnergyActivity {
  id: string;
  action: string;
  points: number;
  date: string;
  post_id?: string;
  type: 'earn' | 'spend';
}

export default function EnergyScreen() {
  const router = useRouter();
  
  const [energyPoint, setEnergyPoint] = useState(0);
  const [activities, setActivities] = useState<EnergyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEnergyData();
  }, []);

  // 加载能量数据
  const loadEnergyData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        console.warn('⚠️ No token found, redirecting to login');
        router.push('/login');
        return;
      }

      // 并行加载能量积分和交易历史
      const [energyResult, historyResult] = await Promise.all([
        getEnergyPoint(token),
        getEnergyHistory(1, token)
      ]);

      console.log('📡 Energy Point Result:', energyResult);
      console.log('📡 Energy History Result:', historyResult);

      // 处理能量积分
      if (energyResult.success && energyResult.data) {
        const energy = energyResult.data.energy_point || 0;
        setEnergyPoint(energy);
        console.log('✅ Energy point loaded:', energy);
      } else {
        console.warn('⚠️ Failed to load energy point:', energyResult.message);
        Alert.alert('提示', '获取能量积分失败');
      }

      // 处理交易历史
      if (historyResult.success && historyResult.data?.history) {
        const formattedActivities: EnergyActivity[] = historyResult.data.history.map((item: any) => ({
          id: item.id || String(Date.now()),
          action: item.action || (item.points > 0 ? 'Read a post' : 'Make a post'),
          points: item.points || 0,
          date: formatDate(item.date || item.createtime || new Date().toISOString()),
          post_id: item.post_id,
          type: item.type || (item.points > 0 ? 'earn' : 'spend')
        }));
        
        setActivities(formattedActivities);
        console.log('✅ Energy history loaded:', formattedActivities.length, 'items');
      } else {
        console.warn('⚠️ No energy history found');
        setActivities([]);
      }

    } catch (error) {
      console.error('❌ Failed to load energy data:', error);
      Alert.alert('错误', '加载能量数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // 今天 - 显示时间
        return date.toLocaleTimeString('zh-CN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        // 超过一周 - 显示日期
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return timestamp;
    }
  };

  // 下拉刷新
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEnergyData();
    setRefreshing(false);
  };

  // 提现功能
  const handleWithdraw = () => {
    Alert.alert(
      'Withdraw Energy',
      `Current balance: ${energyPoint}\n\nAre you sure you want to withdraw your energy points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Withdraw', 
          onPress: async () => {
            try {
              // TODO: 实现提现 API
              Alert.alert('Success', 'Withdrawal request submitted! Please check your email for confirmation.');
            } catch (error) {
              Alert.alert('Error', 'Failed to process withdrawal');
            }
          }
        }
      ]
    );
  };

  // 信息说明
  const handleInfo = () => {
    Alert.alert(
      'Energy Info',
      'Energy points can be earned by:\n\n' +
      '• Reading targeted posts (+10-50 points)\n' +
      '• Completing daily tasks\n\n' +
      'Energy points are spent on:\n\n' +
      '• Creating targeted posts (-1500 points)\n' +
      '• Exchanging for gifts and rewards\n\n' +
      'Keep earning to unlock more benefits!'
    );
  };

  // 返回处理
  const handleBack = () => {
    router.back();
  };

  // 点击交易记录项
  const handleActivityPress = (activity: EnergyActivity) => {
    if (activity.post_id) {
      router.push(`/PostDetail?postid=${activity.post_id}`);
    }
  };

  // 加载中状态
  if (loading) {
    return (
      <SafeAreaProvider>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.headerContainer}>
            <CommonHeader 
              onBack={handleBack}
              title="Energy"
              showMore={false}
            />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF9C00" />
            <Text style={styles.loadingText}>Loading energy data...</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <CommonHeader 
            onBack={handleBack}
            title="Energy"
            showMore={false}
          />
        </View>

        {/* 根背景渐变 */}
        <LinearGradient
          colors={['#F8F9FA', '#FFFFFF']}
          style={styles.gradientBackground}
        >
          <ScrollView 
            style={styles.scrollView}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#FF9C00"
                colors={['#FF9C00']}
              />
            }
          >
            {/* Energy Card - 黄到橙渐变 */}
            <LinearGradient
              colors={['#FFDE64', '#FF9C00']}
              style={styles.energyCard}
            >
              {/* Info按钮 - 移回卡片内右上角 */}
              <TouchableOpacity style={styles.infoButton} onPress={handleInfo}>
                <Ionicons name="information-circle-outline" size={20} color="#4B4B4B" />
              </TouchableOpacity>

              {/* 闪电图标和数字 */}
              <View style={styles.energyContent}>
                <Ionicons name="flash-outline" size={32} color="#1F2937" style={styles.lightningIcon} />
                <Text style={styles.energyValue}>{energyPoint}</Text>
              </View>

              {/* Withdraw按钮 */}
              <TouchableOpacity 
                style={styles.withdrawButton}
                onPress={handleWithdraw}
              >
                <Text style={styles.withdrawText}>Withdraw</Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* Activity List - 白色卡片容器 */}
            {activities.length > 0 ? (
              <View style={styles.activityCard}>
                {activities.map((activity, index) => (
                  <View key={activity.id}>
                    <TouchableOpacity 
                      style={styles.activityItem}
                      onPress={() => handleActivityPress(activity)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.activityLeft}>
                        <Text style={styles.activityAction}>{activity.action}</Text>
                        <Text style={styles.activityDate}>{activity.date}</Text>
                      </View>
                      <View style={styles.activityRight}>
                        <Text style={[
                          styles.activityPoints,
                          activity.points > 0 ? styles.positivePoints : styles.negativePoints
                        ]}>
                          {activity.points > 0 ? `+${activity.points}` : activity.points}
                        </Text>
                        <Ionicons name="chevron-forward" size={12} color="#A0AEC0" />
                      </View>
                    </TouchableOpacity>
                    {/* 分割线 - 最后一项不显示 */}
                    {index < activities.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="flash-outline" size={48} color="#CBD5E0" />
                <Text style={styles.emptyText}>No energy transactions yet</Text>
                <Text style={styles.emptySubtext}>Start reading posts to earn energy!</Text>
              </View>
            )}

            {/* Bottom Spacer */}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  headerContainer: {
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
  
  // 根背景渐变
  gradientBackground: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
  },
  
  // 能量卡片 - 黄到橙渐变
  energyCard: {
    height: 220,
    borderRadius: 24,
    marginHorizontal: 18,
    marginTop: 24,
    justifyContent: 'space-between',
    padding: 24,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  
  // Info按钮 - 卡片右上角
  infoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
    borderRadius: 8,
    zIndex: 1,
  },
  
  // 能量内容区域
  energyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 12,
  },
  
  lightningIcon: {
    marginBottom: 4, // 微调垂直对齐
  },
  
  energyValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1F2937',
  },
  
  // Withdraw按钮 - 浅奶油色
  withdrawButton: {
    alignSelf: 'center',
    backgroundColor: '#FFF3CE',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 40,
  },
  
  withdrawText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#4B4B4B',
    textAlign: 'center',
  },
  
  // 交易列表卡片容器
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 18,
    marginTop: 24,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 8,
  },
  
  // 交易列表项
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    height: 56,
  },
  
  activityLeft: {
    flex: 1,
    gap: 2,
  },
  
  activityAction: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  
  activityDate: {
    fontSize: 10,
    color: '#A0AEC0',
    marginTop: 2,
  },
  
  activityRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  activityPoints: {
    fontSize: 15,
    fontWeight: '600',
  },
  
  positivePoints: {
    color: '#10B981', // 深绿
  },
  
  negativePoints: {
    color: '#EF4444', // 深红
  },
  
  // 分割线
  divider: {
    height: 0.5,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 18,
  },

  // 空状态
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },

  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
    textAlign: 'center',
  },

  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
  },
  
  bottomSpacer: {
    height: 100,
  },
});