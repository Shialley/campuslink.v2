import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'; // 添加 Platform 导入
import Svg, { G, Mask, Path, Rect } from 'react-native-svg';
import { loginUser } from '../services/api';
import { storage } from '../utils/webCompatibility'; // 使用网页兼容的存储

// 眼睛图标组件 - 显示密码（eyes on）
const EyeOnIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Mask id="mask0_132_804" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <Rect width="24" height="24" fill="#D9D9D9"/>
    </Mask>
    <G mask="url(#mask0_132_804)">
      <Path 
        d="M12.0023 15.577C13.1354 15.577 14.0978 15.1804 14.8895 14.3872C15.6812 13.5941 16.077 12.6309 16.077 11.4978C16.077 10.3646 15.6804 9.40217 14.8873 8.6105C14.0941 7.81883 13.1309 7.423 11.9978 7.423C10.8646 7.423 9.90218 7.81958 9.11051 8.61275C8.31885 9.40592 7.92301 10.3691 7.92301 11.5023C7.92301 12.6354 8.3196 13.5978 9.11276 14.3895C9.90593 15.1812 10.8691 15.577 12.0023 15.577ZM12 14.2C11.25 14.2 10.6125 13.9375 10.0875 13.4125C9.56251 12.8875 9.30001 12.25 9.30001 11.5C9.30001 10.75 9.56251 10.1125 10.0875 9.5875C10.6125 9.0625 11.25 8.8 12 8.8C12.75 8.8 13.3875 9.0625 13.9125 9.5875C14.4375 10.1125 14.7 10.75 14.7 11.5C14.7 12.25 14.4375 12.8875 13.9125 13.4125C13.3875 13.9375 12.75 14.2 12 14.2ZM12.0013 18.5C9.70176 18.5 7.60651 17.8657 5.71551 16.597C3.82451 15.3285 2.43218 13.6295 1.53851 11.5C2.43218 9.3705 3.82401 7.6715 5.71401 6.403C7.60418 5.13433 9.6991 4.5 11.9988 4.5C14.2983 4.5 16.3935 5.13433 18.2845 6.403C20.1755 7.6715 21.5678 9.3705 22.4615 11.5C21.5678 13.6295 20.176 15.3285 18.286 16.597C16.3958 17.8657 14.3009 18.5 12.0013 18.5ZM12 17C13.8833 17 15.6125 16.5042 17.1875 15.5125C18.7625 14.5208 19.9667 13.1833 20.8 11.5C19.9667 9.81667 18.7625 8.47917 17.1875 7.4875C15.6125 6.49583 13.8833 6 12 6C10.1167 6 8.38751 6.49583 6.81251 7.4875C5.23751 8.47917 4.03335 9.81667 3.20001 11.5C4.03335 13.1833 5.23751 14.5208 6.81251 15.5125C8.38751 16.5042 10.1167 17 12 17Z" 
        fill="#ACB1C6"
      />
    </G>
  </Svg>
);

// 眼睛图标组件 - 隐藏密码（eyes off）
const EyeOffIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Mask id="mask0_137_921" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <Rect width="24" height="24" fill="#D9D9D9"/>
    </Mask>
    <G mask="url(#mask0_137_921)">
      <Path 
        d="M15.7731 12.973L14.6501 11.85C14.8001 11.0218 14.5638 10.2773 13.9413 9.61625C13.319 8.95542 12.5552 8.7 11.6501 8.85L10.5271 7.727C10.7527 7.62567 10.9842 7.54967 11.2213 7.499C11.4585 7.44834 11.7181 7.423 12.0001 7.423C13.1347 7.423 14.0979 7.81884 14.8896 8.6105C15.6812 9.40217 16.0771 10.3653 16.0771 11.5C16.0771 11.782 16.0517 12.0448 16.0011 12.2885C15.9504 12.532 15.8744 12.7602 15.7731 12.973ZM18.9538 16.0845L17.8501 15.05C18.4834 14.5667 19.0459 14.0375 19.5376 13.4625C20.0292 12.8875 20.4501 12.2333 20.8001 11.5C19.9667 9.81667 18.7709 8.47917 17.2126 7.4875C15.6542 6.49584 13.9167 6 12.0001 6C11.5167 6 11.0417 6.03334 10.5751 6.1C10.1084 6.16667 9.65007 6.26667 9.20007 6.4L8.03482 5.23475C8.66682 4.98342 9.31233 4.79817 9.97132 4.679C10.6303 4.55967 11.3066 4.5 12.0001 4.5C14.3436 4.5 16.457 5.14617 18.3403 6.4385C20.2237 7.73084 21.5974 9.418 22.4616 11.5C22.0911 12.3935 21.6126 13.2275 21.0261 14.002C20.4394 14.7763 19.7487 15.4705 18.9538 16.0845ZM19.7616 21.8693L15.7156 17.8538C15.2027 18.0436 14.6344 18.1988 14.0106 18.3193C13.3869 18.4398 12.7167 18.5 12.0001 18.5C9.65007 18.5 7.53666 17.8538 5.65982 16.5615C3.78282 15.2692 2.40907 13.582 1.53857 11.5C1.90774 10.6167 2.38466 9.79267 2.96932 9.028C3.55399 8.26317 4.19757 7.6 4.90007 7.0385L2.13082 4.2385L3.18482 3.18475L20.8153 20.8153L19.7616 21.8693ZM5.95407 8.09225C5.42574 8.51275 4.91191 9.01825 4.41257 9.60875C3.91324 10.1991 3.50907 10.8295 3.20007 11.5C4.03341 13.1833 5.22924 14.5208 6.78757 15.5125C8.34591 16.5042 10.0834 17 12.0001 17C12.4552 17 12.9085 16.9615 13.3598 16.8845C13.811 16.8077 14.1937 16.7283 14.5078 16.6463L13.2423 15.35C13.0718 15.4192 12.8744 15.4743 12.6501 15.5153C12.4257 15.5564 12.2091 15.577 12.0001 15.577C10.8654 15.577 9.90224 15.1812 9.11058 14.3895C8.31891 13.5978 7.92307 12.6347 7.92307 11.5C7.92307 11.2975 7.94366 11.0857 7.98483 10.8645C8.02583 10.6433 8.08091 10.4411 8.15007 10.2578L5.95407 8.09225Z" 
        fill="#ACB1C6"
      />
    </G>
  </Svg>
);

// 语言文本
const text = {
  EN: {
    welcomeBack: 'Welcome back',
    signInToAccess: 'Sign in to access your account',
    emailAddress: 'Email address',
    password: 'Password',
    enterYourEmail: 'Enter your email',
    enterYourPassword: 'Enter your password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    logIn: 'Log in',
    newMember: 'New Member?',
    registerNow: 'Register now',
    tryWithoutAccount: 'Try Without Account ›',
    loginSuccess: 'Login successful!',
    loginFailed: 'Login failed',
    pleaseEnterEmail: 'Please enter your email',
    pleaseEnterPassword: 'Please enter your password',
    loggingIn: 'Logging in...'
  },
  CN: {
    welcomeBack: '欢迎回来',
    signInToAccess: '输入电子邮箱和密码以登录',
    emailAddress: '电子邮箱',
    password: '密码',
    enterYourEmail: '请输入您注册的邮箱地址',
    enterYourPassword: '请输入您的密码',
    rememberMe: '记住我',
    forgotPassword: '忘记密码?',
    logIn: '登录',
    newMember: '没有账号?',
    registerNow: '点此注册',
    tryWithoutAccount: '暂不登录，直接试用 ›',
    loginSuccess: '登录成功！',
    loginFailed: '登录失败',
    pleaseEnterEmail: '请输入邮箱地址',
    pleaseEnterPassword: '请输入密码',
    loggingIn: '正在登录...'
  }
};

export default function LoginScreen() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'CN'>('EN');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 使用网页兼容的存储获取语言设置
  useFocusEffect(
    useCallback(() => {
      const getLanguage = async () => {
        try {
          const savedLanguage = await storage.getItem('language');
          if (savedLanguage === 'CN' || savedLanguage === 'EN') {
            setLanguage(savedLanguage as 'EN' | 'CN');
          }
        } catch (error) {
          console.error('Failed to get language', error);
        }
      };
      getLanguage();
    }, [])
  );

  // 语言切换功能
  const toggleLanguage = async () => {
    const newLanguage = language === 'EN' ? 'CN' : 'EN';
    setLanguage(newLanguage);
    
    try {
      await storage.setItem('language', newLanguage);
    } catch (error) {
      console.error('Failed to save language', error);
    }
  };

  const t = text[language];

  // 验证输入
  const validateInputs = () => {
    if (!formData.email.trim()) {
      if (Platform.OS === 'web') {
        window.alert(t.pleaseEnterEmail);
      } else {
        Alert.alert('Error', t.pleaseEnterEmail);
      }
      return false;
    }
    if (!formData.password.trim()) {
      if (Platform.OS === 'web') {
        window.alert(t.pleaseEnterPassword);
      } else {
        Alert.alert('Error', t.pleaseEnterPassword);
      }
      return false;
    }
    return true;
  };
  // 修复的登录处理函数
  const handleLogin = async () => {
    console.log('Login button clicked');
    
    if (!validateInputs()) return;

    setIsLoading(true);
    
    try {
      console.log('Attempting login with:', { 
        email: formData.email, 
        password: '***' 
      });

      const loginData = {
        email: formData.email.trim(),
        password: formData.password.trim()
      };

      console.log('About to call loginUser API...');
      const result = await loginUser(loginData);
      console.log('Login API response received:', result);

      if (result.success && result.token) {
        console.log('Login successful, processing token...');
        
        // 从邮箱提取用户名
        const username = formData.email.split('@')[0];
        
        // 使用网页兼容的存储保存登录信息
        console.log('Saving to storage...');
        await storage.setItem('userToken', result.token);
        await storage.setItem('userEmail', formData.email);
        await storage.setItem('username', username);
        await storage.setItem('isLoggedIn', 'true');
        
        // 添加验证存储是否成功
        const verifyToken = await storage.getItem('userToken');
        const verifyLogin = await storage.getItem('isLoggedIn');
        console.log('Storage verification:', { verifyToken: !!verifyToken, verifyLogin });
        
        if (rememberMe) {
          await storage.setItem('rememberMe', 'true');
          await storage.setItem('savedEmail', formData.email);
        }
        
        console.log('Storage saved, attempting navigation...');
          // 网页端特殊处理
        if (Platform.OS === 'web') {
          console.log('Web platform detected, using window.location');
          // 强制刷新到首页，让 index.js 重新检查认证状态
          window.location.href = window.location.origin + '/';
          return;
        }
        
        // 移动端跳转
        try {
          console.log('Attempting router.replace to /');
          router.replace('/');
        } catch (error) {
          console.error('Router replace failed:', error);
          router.push('/');
        }
      } else {
        console.log('Login failed with result:', result);
        const errorMessage = result.message || t.loginFailed;
        
        if (Platform.OS === 'web') {
          window.alert(errorMessage);
        } else {
          Alert.alert('Error', errorMessage);
        }
      }
    } catch (error) {
      console.error('Login error details:', error);
      
      if (Platform.OS === 'web') {
        window.alert('Network error. Please try again.');
      } else {
        Alert.alert('Error', 'Network error. Please try again.');
      }
    } finally {
      console.log('Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/register');
  };

  const handleForgotPassword = () => {
    if (Platform.OS === 'web') {
      window.alert('Forgot password feature coming soon');
    } else {
      Alert.alert('Info', 'Forgot password feature coming soon');
    }
  };
  const handleTryWithoutAccount = () => {
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/CampusLink_Logo.png')}
          style={styles.logo}
        />
      </View>
      
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>{t.welcomeBack}</Text>
        <Text style={styles.stepSubtitle}>{t.signInToAccess}</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t.emailAddress}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.enterYourEmail}
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t.password}</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder={t.enterYourPassword}
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
              secureTextEntry={!passwordVisible}
              editable={!isLoading}
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setPasswordVisible(!passwordVisible)}
              activeOpacity={0.7}
            >
              {passwordVisible ? <EyeOnIcon /> : <EyeOffIcon />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.rememberContainer}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.rememberText}>{t.rememberMe}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotText}>{t.forgotPassword}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? t.loggingIn : t.logIn}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRegister} style={styles.registerContainer}>
          <Text style={styles.footerText}>
            {t.newMember} <Text style={styles.linkText}>{t.registerNow}</Text>
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleTryWithoutAccount} style={styles.tryWithoutContainer}>
          <Text style={styles.tryWithoutText}>{t.tryWithoutAccount}</Text>
        </TouchableOpacity>
      </View>

      {/* Language Toggle Button */}
      <TouchableOpacity style={styles.languageButton} onPress={toggleLanguage}>
        <Text style={styles.languageButtonText}>{language}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    aspectRatio: 1,
  },
  stepContainer: {
    flex: 1,
    marginTop: -10,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E40AF',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rememberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  rememberText: {
    fontSize: 14,
    color: '#6B7280',
  },
  forgotText: {
    fontSize: 14,
    color: '#0A66C2',
  },
  button: {
    width: 281,
    height: 50,
    backgroundColor: '#0A66C2',
    borderRadius: 25,
    paddingHorizontal: 15,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
  },
  linkText: {
    color: '#0A66C2',
  },
  registerContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  tryWithoutContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  tryWithoutText: {
    fontSize: 14,
    color: '#0A66C2',
  },
  // Language toggle button styles (same as boarding screen)
  languageButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4A90E2',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageButtonText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1a73e8',
    borderColor: '#1a73e8',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
  },
});

export { LoginScreen };

