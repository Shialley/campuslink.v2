import { memo } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// 优化图标组件
const BackIcon = memo(() => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M19 12H5M12 19L5 12L12 5"
      stroke="#374151"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
));

interface CommonHeaderProps {
  onBack: () => void;
  title?: string;
  showMore?: boolean;
}

// 使用 memo 优化性能
const CommonHeader = memo<CommonHeaderProps>(({ onBack, title, showMore = true }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.6}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        // 添加这个属性可以提升响应速度
        delayPressIn={0}
      >
        <BackIcon />
      </TouchableOpacity>
      
      {title && (
        <Text style={styles.headerTitle}>{title}</Text>
      )}
      
      <View style={styles.headerSpacer} />
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    zIndex: 1000,
  },
  backButton: {
    padding: 8,
    marginRight: 15,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
});

export default CommonHeader;