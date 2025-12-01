import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// 导入 CommonHeader
import CommonHeader from '../components/CommonHeader';

export default function EnergyScreen() {
  const router = useRouter();

  const activities = [
    { id: 1, action: 'Read a post', points: 35, date: '2024-06-17' },
    { id: 2, action: 'Read a post', points: 130, date: '2024-06-17' },
    { id: 3, action: 'Make a post', points: -1500, date: '2024-06-16' },
    { id: 4, action: 'Read a post', points: 10, date: '2024-06-16' },
  ];

  const handleWithdraw = () => {
    Alert.alert(
      'Withdraw Energy',
      'Are you sure you want to withdraw your energy points?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Withdraw', onPress: () => Alert.alert('Success', 'Withdrawal processed!') }
      ]
    );
  };

  const handleInfo = () => {
    Alert.alert('Energy Info', 'Energy points can be earned by reading posts and spent on creating posts.');
  };

  // 添加返回处理函数
  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header - 移除右侧info按钮 */}
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
          <ScrollView style={styles.scrollView}>
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
                <Text style={styles.energyValue}>1005</Text>
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
            <View style={styles.activityCard}>
              {activities.map((activity, index) => (
                <View key={activity.id}>
                  <TouchableOpacity style={styles.activityItem}>
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
  
  bottomSpacer: {
    height: 100,
  },
});