import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import {
    Alert,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// --- 模拟数据 ---
const COUPON_DATA = [
  { id: 1, title: '山承咖啡厅50-5HKD优惠券', price: '2000' },
  { id: 2, title: '山承咖啡厅50-5HKD优惠券', price: '2000' },
  { id: 3, title: '山承咖啡厅50-5HKD优惠券', price: '2000' },
  { id: 4, title: '山承咖啡厅50-5HKD优惠券', price: '2000' },
];

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

  const handleRecharge = () => {
    Alert.alert('充值', '充值功能开发中...');
  };

  const handleInfo = () => {
    Alert.alert('精力说明', '精力可用于兑换各类优惠券和福利');
  };

  const handleHistory = () => {
    Alert.alert('兑换记录', '查看兑换历史记录');
  };

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

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
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
                <Text style={styles.energyNumber}>1005</Text>
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
          <View style={styles.gridContainer}>
            {COUPON_DATA.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.cardItem}
                activeOpacity={0.7}
                onPress={() => Alert.alert('兑换确认', `确认兑换 ${item.title}？`)}
              >
                {/* 图片区域替换为纯代码绘制的红色票据 */}
                <View style={styles.cardImagePlaceholder}>
                  <RedTicket />
                </View>
                
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                  <View style={styles.priceRow}>
                    <Ionicons name="flash" size={12} color="#FF9317" />
                    <Text style={styles.priceText}>{item.price}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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