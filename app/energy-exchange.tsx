import { getEnergyPoint, getGiftList, redeemGift } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// 礼物/优惠券数据接口
interface Gift {
  id: number;
  name: string;
  price: number;
  left_number?: number;
  description?: string;
}

// --- 组件：红色优惠券样式 (纯代码绘制) ---
const RedTicket = () => {
  return (
    <View style={styles.ticketContainer}>
      {/* 票据左侧半圆缺口 */}
      <View style={[styles.ticketNotch, styles.ticketNotchLeft]} />
      
      {/* 票据内容 */}
      <View style={styles.ticketContent}>
        <View style={styles.ticketLeft}>
          <Text style={styles.ticketLabel}>COUPON</Text>
        </View>
        <View style={styles.dashedLine} />
        <View style={styles.ticketRight}>
          <Text style={styles.ticketTitle}>DISCOUNT VOUCHER</Text>
          <Text style={styles.ticketValue}>SAVE 50%</Text>
        </View>
      </View>

      {/* 票据右侧半圆缺口 */}
      <View style={[styles.ticketNotch, styles.ticketNotchRight]} />
    </View>
  );
};

export default function EnergyExchangeScreen() {
  const router = useRouter();
  
  const [energyPoint, setEnergyPoint] = useState(0);
  const [giftList, setGiftList] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    loadExchangeData();
  }, []);

  // 加载兑换数据
  const loadExchangeData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        console.warn('⚠️ No token found, redirecting to login');
        router.push('/login');
        return;
      }

      // 并行加载能量积分和礼物列表
      const [energyResult, giftsResult] = await Promise.all([
        getEnergyPoint(token),
        getGiftList(token)
      ]);

      console.log('📡 Energy Point Result:', energyResult);
      console.log('📡 Gift List Result:', giftsResult);

      // 处理能量积分
      if (energyResult.success && energyResult.data) {
        const energy = energyResult.data.energy_point || 0;
        setEnergyPoint(energy);
        console.log('✅ Energy point loaded:', energy);
      } else {
        console.warn('⚠️ Failed to load energy point:', energyResult.message);
        Alert.alert('提示', '获取能量积分失败');
      }

      // 处理礼物列表
      if (giftsResult.success && giftsResult.data?.items) {
        setGiftList(giftsResult.data.items);
        console.log('✅ Gift list loaded:', giftsResult.data.items.length, 'items');
      } else {
        console.warn('⚠️ No gifts found');
        setGiftList([]);
      }

    } catch (error) {
      console.error('❌ Failed to load exchange data:', error);
      Alert.alert('错误', '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 下拉刷新
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadExchangeData();
    setRefreshing(false);
  };

  // 充值功能
  const handleRecharge = () => {
    Alert.alert(
      '充值',
      '充值功能即将推出！\n\n您可以通过以下方式获得能量：\n• 阅读定向消息（+10-50）\n• 完成每日任务',
      [{ text: '知道了' }]
    );
  };

  // 精力说明
  const handleInfo = () => {
    Alert.alert(
      '精力说明',
      '精力可以用于兑换各类优惠券和福利\n\n' +
      '获取方式：\n' +
      '• 阅读定向消息获得能量\n' +
      '• 完成每日任务\n\n' +
      '使用方式：\n' +
      '• 兑换优惠券和礼物\n' +
      '• 发送定向消息（-1500）',
      [{ text: '知道了' }]
    );
  };

  // 兑换历史
  const handleHistory = () => {
    router.push('/energy');
  };

  // 兑换礼物
  const handleRedeemGift = async (gift: Gift) => {
    try {
      // 检查能量是否足够
      if (energyPoint < gift.price) {
        Alert.alert(
          '能量不足',
          `兑换 ${gift.name} 需要 ${gift.price} 能量\n当前能量: ${energyPoint}`,
          [
            { text: '取消', style: 'cancel' },
            { text: '去赚取', onPress: () => router.push('/') }
          ]
        );
        return;
      }

      // 检查库存
      if (gift.left_number !== undefined && gift.left_number <= 0) {
        Alert.alert('提示', '该礼物已兑换完毕');
        return;
      }

      // 确认兑换
      Alert.alert(
        '确认兑换',
        `确认使用 ${gift.price} 能量兑换\n${gift.name}？`,
        [
          { text: '取消', style: 'cancel' },
          { 
            text: '确认兑换',
            onPress: async () => {
              await performRedeem(gift);
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error preparing redemption:', error);
      Alert.alert('错误', '兑换准备失败');
    }
  };

  // 执行兑换
  const performRedeem = async (gift: Gift) => {
    try {
      setRedeeming(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('提示', '请先登录');
        router.push('/login');
        return;
      }

      console.log('📡 Redeeming gift:', gift.id);
      const result = await redeemGift(gift.id, token);
      
      console.log('✅ Redeem result:', result);

      if (result.success) {
        // 更新能量值
        if (result.data?.energy_point !== undefined) {
          setEnergyPoint(result.data.energy_point);
        } else {
          setEnergyPoint(prev => prev - gift.price);
        }

        // 更新礼物列表中的库存
        setGiftList(prevList => 
          prevList.map(g => 
            g.id === gift.id && g.left_number !== undefined
              ? { ...g, left_number: g.left_number - 1 }
              : g
          )
        );

        Alert.alert(
          '兑换成功',
          `恭喜您成功兑换 ${gift.name}！\n\n请在"能量"页面查看兑换记录`,
          [
            { text: '查看记录', onPress: () => router.push('/energy') },
            { text: '继续兑换', style: 'cancel' }
          ]
        );
      } else {
        console.warn('⚠️ Redeem failed:', result.message);
        Alert.alert('兑换失败', result.message || '兑换失败，请稍后重试');
      }
    } catch (error) {
      console.error('❌ Error redeeming gift:', error);
      Alert.alert('错误', '兑换时发生错误');
    } finally {
      setRedeeming(false);
    }
  };

  // 渲染单个礼物卡片
  const renderGiftItem = ({ item }: { item: Gift }) => (
    <TouchableOpacity 
      style={styles.cardItem}
      activeOpacity={0.7}
      onPress={() => handleRedeemGift(item)}
      disabled={redeeming || (item.left_number !== undefined && item.left_number <= 0)}
    >
      {/* 图片区域替换为纯代码绘制的红色票据 */}
      <View style={styles.cardImagePlaceholder}>
        <RedTicket />
        {/* 库存标签 */}
        {item.left_number !== undefined && (
          <View style={[
            styles.stockBadge,
            item.left_number <= 0 && styles.stockBadgeEmpty
          ]}>
            <Text style={styles.stockText}>
              {item.left_number <= 0 ? '已兑完' : `剩余 ${item.left_number}`}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
        <View style={styles.priceRow}>
          <Ionicons name="flash" size={12} color="#FF9317" />
          <Text style={styles.priceText}>{item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // 加载中状态
  if (loading) {
    return (
      <SafeAreaProvider>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>精力兑换</Text>
            <TouchableOpacity style={styles.iconButton} onPress={handleHistory}>
              <Ionicons name="time-outline" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFC107" />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {/* 1. 顶部导航栏 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>精力兑换</Text>
          <TouchableOpacity style={styles.iconButton} onPress={handleHistory}>
            <Ionicons name="time-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#FFC107"
              colors={['#FFC107']}
            />
          }
        >
          
          {/* 2. 黄色精力卡片 */}
          <View style={styles.energyCard}>
            {/* 右上角提示图标 */}
            <TouchableOpacity style={styles.infoIconContainer} onPress={handleInfo}>
              <Ionicons name="information-circle-outline" size={22} color="#475569" />
            </TouchableOpacity>

            <View style={styles.energyMainContent}>
              {/* 闪电图标 + 数字 */}
              <View style={styles.energyValueRow}>
                <Ionicons name="flash" size={50} color="#334155" style={{ marginRight: 5 }} />
                <Text style={styles.energyNumber}>{energyPoint}</Text>
              </View>

              {/* 充值按钮 */}
              <TouchableOpacity 
                style={styles.rechargeButton}
                activeOpacity={0.8}
                onPress={handleRecharge}
              >
                <Text style={styles.rechargeButtonText}>充值</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. 优惠券列表 */}
          {giftList.length > 0 ? (
            <View style={styles.gridContainer}>
              {giftList.map((item) => (
                <View key={item.id}>
                  {renderGiftItem({ item })}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="gift-outline" size={48} color="#CBD5E0" />
              <Text style={styles.emptyText}>暂无可兑换的礼物</Text>
              <Text style={styles.emptySubtext}>敬请期待更多精彩礼物</Text>
            </View>
          )}

          {/* 底部间距 */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // --- Header ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  iconButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 40,
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

  // --- 黄色大卡片 ---
  energyCard: {
    backgroundColor: '#FFC107', // 亮黄色背景
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    height: 200, // 固定高度
    justifyContent: 'space-between',
    // 阴影
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  infoIconContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  energyMainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  energyValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  energyNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#334155', // 深灰蓝
  },
  rechargeButton: {
    backgroundColor: 'rgba(255,255,255,0.5)', // 半透明白
    paddingVertical: 10,
    width: '80%',
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#fff',
    alignItems: 'center',
  },
  rechargeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
  },

  // --- 网格列表 ---
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  cardItem: {
    width: (width - 40 - 15) / 2, // (屏幕宽 - 边距 - 中间缝隙) / 2
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    padding: 10,
    // 卡片阴影
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 90,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  stockBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  stockBadgeEmpty: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  stockText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  cardTextContainer: {
    gap: 4,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  priceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF9317',
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
    height: 40,
  },

  // --- 纯CSS绘制的红色票据 ---
  ticketContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#D32F2F', // 票据红
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  ticketContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketLeft: {
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
  },
  ticketLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 8,
    fontWeight: 'bold',
    // 旋转文字
    transform: [{ rotate: '-90deg' }],
    width: 60,
    textAlign: 'center',
  },
  dashedLine: {
    width: 1,
    height: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  ticketRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 7,
    marginBottom: 2,
  },
  ticketValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // 票据缺口 (用白色圆圈模拟)
  ticketNotch: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff', // 与卡片背景色一致
    top: '50%',
    marginTop: -6,
    zIndex: 10,
  },
  ticketNotchLeft: {
    left: -6,
  },
  ticketNotchRight: {
    right: -6,
  },
});