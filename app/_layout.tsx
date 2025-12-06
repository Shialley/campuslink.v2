import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Auth screens */}
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          
          {/* Main screens */}
          <Stack.Screen name="index" />
          <Stack.Screen name="post" />
          <Stack.Screen name="Profile" />
          <Stack.Screen name="PostDetail" />
          <Stack.Screen name="TargetedPostDetail" />
          
          {/* Profile sub-screens */}
          <Stack.Screen name="edit-profile" />
          <Stack.Screen name="energy" />
          <Stack.Screen name="previous-posts" />
          <Stack.Screen name="my-favorites" />
          <Stack.Screen name="general-settings" />
          <Stack.Screen name="help-support" />
          <Stack.Screen name="terms-of-service" />
          <Stack.Screen name="privacy-policy" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
