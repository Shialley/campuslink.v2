import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import CommonHeader from '../components/CommonHeader'; // 导入 CommonHeader

const generalSettingsContent = {
  EN: {
    title: 'General Settings',
    developmentStatus: 'Under Active Development',
    lastUpdated: 'Last updated: August 26, 2025',
    provider: 'Provider: CampusLink Limited (Hong Kong SAR)',
    contact: 'Contact: campuslink_service@outlook.com',
    sections: [
      {
        title: 'Current Status',
        content: [
          '🚀 We are working hard to bring you the best general settings experience!',
          '🔧 Our development team is actively building new features including:',
          '• Theme customization (Light/Dark mode)',
          '• Language preferences',
          '• Notification settings',
          '• Privacy controls',
          '• Account management tools',
          '• Data export options'
        ]
      },
      {
        title: 'Coming Soon',
        content: [
          '📱 Mobile app optimization',
          '🎨 Personalized interface themes',
          '🔔 Advanced notification controls',
          '🌐 Multi-language support expansion',
          '🔒 Enhanced privacy settings',
          '💾 Data backup and sync options',
          '⚙️ Advanced user preferences'
        ]
      },
      {
        title: 'How to Stay Updated',
        content: [
          '• Check this page regularly for development updates',
          '• Follow our announcements in the main feed',
          '• Contact us at campuslink_service@outlook.com for feature requests',
          '• Your feedback helps us prioritize which features to build first!'
        ]
      }
    ]
  },
  CN: {
    title: '通用设置',
    developmentStatus: '正在全力开发中',
    lastUpdated: '最后更新：2025年8月26日',
    provider: '提供方：CampusLink Limited（香港特别行政区）',
    contact: '联系邮箱：campuslink_service@outlook.com',
    sections: [
      {
        title: '当前状态',
        content: [
          '🚀 我们正在努力为您带来最佳的通用设置体验！',
          '🔧 我们的开发团队正在积极构建新功能，包括：',
          '• 主题自定义（浅色/深色模式）',
          '• 语言偏好设置',
          '• 通知设置',
          '• 隐私控制',
          '• 账户管理工具',
          '• 数据导出选项'
        ]
      },
      {
        title: '即将推出',
        content: [
          '📱 移动应用优化',
          '🎨 个性化界面主题',
          '🔔 高级通知控制',
          '🌐 多语言支持扩展',
          '🔒 增强隐私设置',
          '💾 数据备份和同步选项',
          '⚙️ 高级用户偏好设置'
        ]
      },
      {
        title: '如何获取更新',
        content: [
          '• 定期查看此页面了解开发进展',
          '• 关注主页面中的公告',
          '• 通过 campuslink_service@outlook.com 联系我们提出功能建议',
          '• 您的反馈帮助我们确定优先构建哪些功能！'
        ]
      }
    ]
  }
};

export default function GeneralSettingsScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState<'EN' | 'CN'>('EN');

  useFocusEffect(
    useCallback(() => {
      const loadLanguage = async () => {
        try {
          const savedLanguage = await AsyncStorage.getItem('language');
          if (savedLanguage && (savedLanguage === 'EN' || savedLanguage === 'CN')) {
            setLanguage(savedLanguage);
          }
        } catch (error) {
          console.error('Failed to load language:', error);
        }
      };
      loadLanguage();
    }, [])
  );

  const toggleLanguage = async () => {
    const newLanguage = language === 'EN' ? 'CN' : 'EN';
    setLanguage(newLanguage);
    try {
      await AsyncStorage.setItem('language', newLanguage);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  };

  const content = generalSettingsContent[language];

  return (
    <SafeAreaProvider>
      {/* 隐藏原生 header */}
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      {/* 修改：使用 edges={['top']} 与 followers 保持一致 */}
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* 使用 CommonHeader */}
        <CommonHeader 
          onBack={() => router.back()}
          title={content.title}
        />
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* 开发状态标识 */}
            <View style={styles.statusBanner}>
              <Text style={styles.statusText}>{content.developmentStatus}</Text>
            </View>
            
            <Text style={styles.lastUpdated}>{content.lastUpdated}</Text>
            <Text style={styles.provider}>{content.provider}</Text>
            <Text style={styles.contact}>{content.contact}</Text>
            
            {content.sections.map((section, index) => (
              <View key={index} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.content.map((item, itemIndex) => (
                  <Text key={itemIndex} style={styles.sectionContent}>
                    {item}
                  </Text>
                ))}
              </View>
            ))}
            
            {/* 额外的提示信息 */}
            <View style={styles.noteSection}>
              <Text style={styles.noteTitle}>
                {language === 'EN' ? '📝 Note' : '📝 注意'}
              </Text>
              <Text style={styles.noteContent}>
                {language === 'EN' 
                  ? 'This page will be updated with new settings as they become available. Thank you for your patience as we work to improve your CampusLink experience!'
                  : '此页面将随着新设置的可用而更新。感谢您的耐心，我们正在努力改善您的 CampusLink 体验！'
                }
              </Text>
            </View>
          </View>
        </ScrollView>
        
        {/* Language toggle button */}
        <TouchableOpacity style={styles.languageButton} onPress={toggleLanguage}>
          <Text style={styles.languageButtonText}>
            {language === 'EN' ? '中文' : 'EN'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  statusBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  provider: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  contact: {
    fontSize: 14,
    color: '#4A90E2',
    marginBottom: 20,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 24,
  },
  sectionContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 8,
  },
  noteSection: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0C4A6E',
    marginBottom: 8,
  },
  noteContent: {
    fontSize: 14,
    color: '#075985',
    lineHeight: 20,
  },
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
});