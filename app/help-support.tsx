import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import CommonHeader from '../components/CommonHeader'; // 导入 CommonHeader

interface HelpItem {
  title: string;
  description: string;
  action?: () => void;
}

interface HelpSection {
  title: string;
  items: HelpItem[];
}

interface HelpContent {
  title: string;
  sections: HelpSection[];
}

const helpContent: { EN: HelpContent; CN: HelpContent; HK: HelpContent } = {
  EN: {
    title: 'Help & Support',
    sections: [
      {
        title: 'Contact Us',
        items: [
          {
            title: 'Email Support',
            description: 'campuslink_service@outlook.com',
            action: () => Linking.openURL('mailto:campuslink_service@outlook.com'),
          }
        ]
      },
      {
        title: 'Frequently Asked Questions',
        items: [
          {
            title: 'How do I verify my campus identity?',
            description: 'Go to My Account and follow the verification process. You\'ll need to provide your school email address and proof of enrollment/employment.',
          },
          {
            title: 'What are Energy Points?',
            description: 'Energy Points are virtual points used within the platform for targeted messaging, feature unlocks, and rewards. They cannot be converted to cash.',
          },
          {
            title: 'How do I change my language preference?',
            description: 'You can toggle between English and Chinese using the language button in the bottom right corner of most screens.',
          },
          {
            title: 'How do I report inappropriate content?',
            description: 'You can report posts or users by using the report function available on each post or user profile.',
          },
          {
            title: 'How do I delete my account?',
            description: 'Contact our support team at campuslink_service@outlook.com for account deletion requests.',
          }
        ]
      },
      {
        title: 'Quick Links',
        items: [
          {
            title: 'Terms of Service',
            description: 'View our complete terms of service',
          },
          {
            title: 'Privacy Policy',
            description: 'Learn about how we protect your data',
          }
        ]
      }
    ]
  },
  CN: {
    title: '帮助与支持',
    sections: [
      {
        title: '联系我们',
        items: [
          {
            title: '邮件支持',
            description: 'campuslink_service@outlook.com',
            action: () => Linking.openURL('mailto:campuslink_service@outlook.com'),
          }
        ]
      },
      {
        title: '常见问题',
        items: [
          {
            title: '如何验证校园身份？',
            description: '进入"我的账户"并按照验证流程操作。您需要提供学校邮箱地址和在读/在职证明。',
          },
          {
            title: '什么是精力值？',
            description: '精力值是平台内使用的虚拟积分，用于定向消息、功能解锁和兑换奖励。不能兑换为现金。',
          },
          {
            title: '如何更改语言偏好？',
            description: '您可以使用大多数屏幕右下角的语言按钮在中英文之间切换。',
          },
          {
            title: '如何举报不当内容？',
            description: '您可以使用每个帖子或用户资料上的举报功能来举报帖子或用户。',
          },
          {
            title: '如何删除我的账户？',
            description: '请联系我们的支持团队 campuslink_service@outlook.com 申请删除账户。',
          }
        ]
      },
      {
        title: '快速链接',
        items: [
          {
            title: '服务条款',
            description: '查看我们的完整服务条款',
          },
          {
            title: '隐私政策',
            description: '了解我们如何保护您的数据',
          }
        ]
      }
    ]
  },
  HK: {
    title: '幫助與支援',
    sections: [
      {
        title: '聯絡我們',
        items: [
          {
            title: '電郵支援',
            description: 'campuslink_service@outlook.com',
            action: () => Linking.openURL('mailto:campuslink_service@outlook.com'),
          }
        ]
      },
      {
        title: '常見問題',
        items: [
          {
            title: '如何驗證校園身分？',
            description: '進入「我的帳戶」並按照驗證流程操作。您需要提供學校電郵地址和在讀/在職證明。',
          },
          {
            title: '什麼是精力值？',
            description: '精力值是平台內使用的虛擬積分，用於定向訊息、功能解鎖和兌換獎勵。不能兌換為現金。',
          },
          {
            title: '如何更改語言偏好？',
            description: '您可以使用大多數畫面右下角的語言按鈕在中英文之間切換。',
          },
          {
            title: '如何檢舉不當內容？',
            description: '您可以使用每個帖文或用戶資料上的檢舉功能來檢舉帖文或用戶。',
          },
          {
            title: '如何刪除我的帳戶？',
            description: '請聯絡我們的支援團隊 campuslink_service@outlook.com 申請刪除帳戶。',
          }
        ]
      },
      {
        title: '快速連結',
        items: [
          {
            title: '服務條款',
            description: '查看我們的完整服務條款',
          },
          {
            title: '私隱政策',
            description: '了解我們如何保護您的資料',
          }
        ]
      }
    ]
  }
};

export default function HelpSupportScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState<'EN' | 'CN' | 'HK'>('EN');

  useFocusEffect(
    useCallback(() => {
      const loadLanguage = async () => {
        try {
          const savedLanguage = await AsyncStorage.getItem('language');
          if (savedLanguage && (savedLanguage === 'EN' || savedLanguage === 'CN' || savedLanguage === 'HK')) {
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
    let newLanguage: 'EN' | 'CN' | 'HK';
    if (language === 'EN') {
      newLanguage = 'CN';
    } else if (language === 'CN') {
      newLanguage = 'HK';
    } else {
      newLanguage = 'EN';
    }
    
    setLanguage(newLanguage);
    try {
      await AsyncStorage.setItem('language', newLanguage);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  };

  const getLanguageButtonText = () => {
    switch (language) {
      case 'EN': return '简体';
      case 'CN': return '繁體';
      case 'HK': return 'EN';
      default: return '简体';
    }
  };

  const content = helpContent[language];

  const getItemAction = (sectionIndex: number, itemIndex: number): (() => void) | undefined => {
    if (sectionIndex === 2) { // Quick Links section
      if (itemIndex === 0) { // Terms of Service
        return () => router.push('/terms-of-service');
      } else if (itemIndex === 1) { // Privacy Policy
        return () => router.push('/privacy-policy');
      }
    }
    return content.sections[sectionIndex].items[itemIndex].action;
  };

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
            {content.sections.map((section, sectionIndex) => (
              <View key={sectionIndex} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.items.map((item, itemIndex) => {
                  const itemAction = getItemAction(sectionIndex, itemIndex);
                  return (
                    <TouchableOpacity 
                      key={itemIndex} 
                      style={styles.helpItem}
                      onPress={itemAction || (() => {})}
                      disabled={!itemAction}
                    >
                      <View style={styles.helpItemContent}>
                        <Text style={styles.helpItemTitle}>{item.title}</Text>
                        <Text style={styles.helpItemDescription}>{item.description}</Text>
                      </View>
                      {itemAction && (
                        <View style={styles.chevronContainer}>
                          <Text style={styles.chevron}>›</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
        
        {/* Language toggle button */}
        <TouchableOpacity style={styles.languageButton} onPress={toggleLanguage}>
          <Text style={styles.languageButtonText}>
            {getLanguageButtonText()}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  helpItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
    elevation: 2,
  },
  helpItemContent: {
    flex: 1,
  },
  helpItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  helpItemDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  chevronContainer: {
    marginLeft: 12,
  },
  chevron: {
    fontSize: 18,
    color: '#9CA3AF',
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