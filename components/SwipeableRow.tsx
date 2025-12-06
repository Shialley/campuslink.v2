import React from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from "react-native-reanimated";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25; // 超过 25% 触发动作
const ACTION_WIDTH = 100; // 动作按钮宽度

interface SwipeableRowProps {
  item: any;
  children: React.ReactNode;
  onDelete: (item: any) => void;
  onBookmark: (item: any) => void;
}

export default function SwipeableRow({ 
  item, 
  children, 
  onDelete, 
  onBookmark 
}: SwipeableRowProps) {
  const translateX = useSharedValue(0);
  const contextX = useSharedValue(0);

  const pan = Gesture.Pan()
    .onStart(() => {
      contextX.value = translateX.value;
    })
    .onUpdate((event) => {
      translateX.value = contextX.value + event.translationX;
      // 限制左、右最大滑动距离
      translateX.value = Math.max(-ACTION_WIDTH * 1.2, Math.min(translateX.value, ACTION_WIDTH * 1.2));
    })
    .onEnd(() => {
      // 左滑超过阈值 = 删除
      if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-ACTION_WIDTH, { damping: 20 });
        runOnJS(onDelete)(item);
        // 延迟后回弹
        setTimeout(() => {
          translateX.value = withSpring(0, { damping: 20 });
        }, 300);
        return;
      }

      // 右滑超过阈值 = 收藏
      if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withSpring(ACTION_WIDTH, { damping: 20 });
        runOnJS(onBookmark)(item);
        // 延迟后回弹
        setTimeout(() => {
          translateX.value = withSpring(0, { damping: 20 });
        }, 300);
        return;
      }

      // 否则回弹
      translateX.value = withSpring(0, { damping: 20 });
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));

  // 左侧收藏动作的动画样式
  const leftActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, ACTION_WIDTH],
      [0, 1],
      Extrapolate.CLAMP
    );
    
    const scale = interpolate(
      translateX.value,
      [0, ACTION_WIDTH],
      [0.8, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }]
    };
  });

  // 右侧删除动作的动画样式
  const rightActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-ACTION_WIDTH, 0],
      [1, 0],
      Extrapolate.CLAMP
    );
    
    const scale = interpolate(
      translateX.value,
      [-ACTION_WIDTH, 0],
      [1, 0.8],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }]
    };
  });

  return (
    <View style={styles.container}>
      {/* 背景动作区 */}
      <View style={styles.actionContainer}>
        {/* 左侧收藏 */}
        <Animated.View style={[styles.leftAction, leftActionStyle]}>
          <Image
            source={require('@/assets/images/save.png')}
            style={styles.actionIcon}
          />
          <Text style={styles.actionText}>收藏</Text>
        </Animated.View>

        {/* 右侧删除 */}
        <Animated.View style={[styles.rightAction, rightActionStyle]}>
          <Text style={styles.actionText}>删除</Text>
          <Text style={styles.deleteIcon}>🗑️</Text>
        </Animated.View>
      </View>

      {/* 前景可滑区域 */}
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.row, rowStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
  },
  row: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftAction: {
    width: ACTION_WIDTH,
    height: "100%",
    backgroundColor: "#FFB800",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 15,
  },
  rightAction: {
    width: ACTION_WIDTH,
    height: "100%",
    backgroundColor: "#FF5252",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 15,
  },
  actionIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
    tintColor: "#FFFFFF",
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteIcon: {
    fontSize: 24,
    marginTop: 4,
  }
});