import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// 导入API函数
import { getUserProfile, updateUserProfile, UserProfile } from '../services/api';
// 导入 CommonHeader
import CommonHeader from '../components/CommonHeader';

// 香港八大院校数据
const HK_UNIVERSITIES = [
  { id: 'HKU', name: 'The University of Hong Kong', shortName: 'HKU' },
  { id: 'CUHK', name: 'The Chinese University of Hong Kong', shortName: 'CUHK' },
  { id: 'HKUST', name: 'The Hong Kong University of Science and Technology', shortName: 'HKUST' },
  { id: 'CityU', name: 'City University of Hong Kong', shortName: 'CityU' },
  { id: 'PolyU', name: 'The Hong Kong Polytechnic University', shortName: 'PolyU' },
  { id: 'HKBU', name: 'Hong Kong Baptist University', shortName: 'HKBU' },
  { id: 'LU', name: 'Lingnan University', shortName: 'LU' },
  { id: 'EdUHK', name: 'The Education University of Hong Kong', shortName: 'EdUHK' },
];

const DEGREE_TYPES = [
  { id: 'undergraduate', name: 'Undergraduate' },
  { id: 'postgraduate', name: 'Postgraduate' },
  { id: 'faculty', name: 'Faculty' },
  { id: 'staff', name: 'Staff' },
  { id: 'alumni', name: 'Alumni' },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // 用户资料状态
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    username: '',
    email: '',
    real_name: '',
    avatar: '',
    school: '',
    type: '',
    major: '',
    institution: '',
    introduction: '',
    verification: '',
  });

  // 编辑状态
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingIntroduction, setIsEditingIntroduction] = useState(false);
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  // 临时输入值
  const [tempName, setTempName] = useState('');
  const [tempIntroduction, setTempIntroduction] = useState('');

  // 加载用户资料
  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (token) {
        console.log('Loading user profile for editing...');
        const result = await getUserProfile(token);
        
        if (result.success && result.data) {
          console.log('Profile loaded successfully:', result.data);
          
          // 调试：检查数据类型
          console.log('Data types:', {
            id: typeof result.data.id,
            username: typeof result.data.username,
            email: typeof result.data.email,
            real_name: typeof result.data.real_name,
            school: typeof result.data.school,
            type: typeof result.data.type,
            major: typeof result.data.major,
            institution: typeof result.data.institution,
            introduction: typeof result.data.introduction,
          });
          
          setProfile({
            id: String(result.data.id || ''),
            username: String(result.data.username || ''),
            email: String(result.data.email || ''),
            real_name: String(result.data.real_name || ''),
            avatar: String(result.data.avatar || ''),
            school: String(result.data.school || ''),
            type: String(result.data.type || ''),
            major: String(result.data.major || ''),
            institution: String(result.data.institution || ''),
            introduction: String(result.data.introduction || ''),
            verification: String(result.data.verification || result.data.school || ''),
          });
        } else {
          console.log('Profile API failed, using default data:', result.message);
          // 使用默认数据
          setProfile({
            id: '12345678',
            username: 'Alice',
            email: 'alice@example.com',
            real_name: 'Alice Wang',
            avatar: '', // 确保是字符串而不是 undefined
            verification: 'CUHK',
            introduction: 'A year-3 student studying xxx in CUHK. Be interested in XXX',
            school: 'CUHK',
            type: 'Undergraduate',
            major: '', // 确保是字符串而不是 undefined
            institution: '', // 确保是字符串而不是 undefined
          });
        }
      } else {
        console.log('No token found');
        Alert.alert('Error', 'Please login first', [
          { text: 'OK', onPress: () => router.replace('/login') }
        ]);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
      // 使用默认数据作为后备
      setProfile({
        id: '12345678',
        username: 'Alice',
        email: 'alice@example.com',
        real_name: 'Alice Wang',
        avatar: '', // 确保是字符串而不是 undefined
        verification: 'CUHK',
        introduction: 'A year-3 student studying xxx in CUHK. Be interested in XXX',
        school: 'CUHK',
        type: 'Undergraduate',
        major: '', // 确保是字符串而不是 undefined
        institution: '', // 确保是字符串而不是 undefined
      });
    } finally {
      setLoading(false);
    }
  };

  // 页面聚焦时加载用户资料
  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
    }, [])
  );

  // 保存用户资料 - 集成真实API
  const handleSave = async () => {
    setSaving(true);
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (token) {
        console.log('Updating user profile:', profile);
        
        // 准备更新数据（只发送需要更新的字段）
        const updateData: Partial<UserProfile> = {
          username: profile.username,
          real_name: profile.real_name,
          introduction: profile.introduction,
          school: profile.school,
          type: profile.type,
          major: profile.major,
          institution: profile.institution,
        };

        const result = await updateUserProfile(updateData, token);

        if (result.success) {
          // 更新本地存储
          await AsyncStorage.setItem('username', profile.username);
          
          Alert.alert('Success', 'Profile updated successfully!', [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]);
        } else {
          Alert.alert('Error', result.message || 'Failed to update profile');
        }
      } else {
        Alert.alert('Error', 'Please login first');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // 处理用户名编辑
  const handleNameEdit = () => {
    setTempName(profile.username);
    setIsEditingName(true);
  };

  const handleNameSave = () => {
    if (tempName.trim()) {
      setProfile(prev => ({ ...prev, username: tempName.trim() }));
    }
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setTempName('');
    setIsEditingName(false);
  };

  // 处理介绍编辑
  const handleIntroductionEdit = () => {
    setTempIntroduction(profile.introduction || '');
    setIsEditingIntroduction(true);
  };

  const handleIntroductionSave = () => {
    setProfile(prev => ({ ...prev, introduction: tempIntroduction }));
    setIsEditingIntroduction(false);
  };

  const handleIntroductionCancel = () => {
    setTempIntroduction('');
    setIsEditingIntroduction(false);
  };

  // 处理学校选择
  const handleSchoolSelect = (school: any) => {
    console.log('handleSchoolSelect called with:', school);
    setProfile(prev => ({ 
      ...prev, 
      school: school.shortName 
    }));
    setShowSchoolPicker(false);
  };

  // 处理类型选择
  const handleTypeSelect = (type: any) => {
    console.log('handleTypeSelect called with:', type);
    setProfile(prev => ({ 
      ...prev, 
      type: type.name 
    }));
    setShowTypePicker(false);
  };

  // 添加返回处理函数
  const handleBack = useCallback(() => {
    if (saving) return; // 保存中不允许返回
    router.back();
  }, [saving]);

  // 添加一个安全的文本渲染函数
  const safeText = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value);
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <CommonHeader 
            onBack={handleBack}
            title="Profile"
            showMore={false}
          />
          
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}> {/* 改回edges={['top']} */}
        {/* Header */}
        <View style={styles.headerContainer}>
          <CommonHeader 
            onBack={handleBack}
            title="Profile"
            showMore={false}
          />
        </View>

        {/* LinearGradient Background */}
        <LinearGradient
          colors={['#F8F9FA', '#FFFFFF']}
          style={styles.gradientBackground}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {/* Profile Photo Card */}
            <View style={styles.menuCard}>
              <View style={styles.photoSection}>
                <View style={styles.photoContainer}>
                  <Image
                    source={{
                      uri: profile.avatar || "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/1d39bdc7-8fd1-469d-802d-e6f3e2c968cd"
                    }}
                    style={styles.profilePhoto}
                  />
                  <TouchableOpacity style={styles.editPhotoIcon}>
                    <Image
                      source={require('../assets/images/edit_profile.png')}
                      style={styles.editIcon}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Basic Information Card */}
            <View style={styles.menuCard}>
              {/* User name */}
              <TouchableOpacity style={styles.menuItem} onPress={handleNameEdit}>
                <Text style={styles.labelStyle}>User name</Text>
                <Text style={styles.valueStyle}>{safeText(profile.username)}</Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>

              {/* Verification */}
              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.labelStyle}>Verification</Text>
                <View style={styles.verificationContainer}>
                  <Text style={styles.valueStyle}>{safeText(profile.verification)}</Text>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>

              {/* User ID */}
              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.labelStyle}>User ID</Text>
                <Text style={styles.valueStyle}>{safeText(profile.id)}</Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Introduction Card */}
            <View style={styles.menuCard}>
              <TouchableOpacity style={styles.menuItem} onPress={handleIntroductionEdit}>
                <Text style={styles.labelStyle}>Introduction</Text>
                <Text style={styles.introValue} numberOfLines={2} ellipsizeMode="tail">
                  {safeText(profile.introduction) || 'Add an introduction...'}
                </Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Detailed Information Card */}
            <View style={styles.menuCard}>
              <Text style={styles.sectionTitle}>Detailed information</Text>
              
              <TouchableOpacity style={styles.menuItem} onPress={() => setShowSchoolPicker(true)}>
                <Text style={styles.labelStyle}>University</Text>
                <Text style={styles.valueStyle}>{safeText(profile.school)}</Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => setShowTypePicker(true)}>
                <Text style={styles.labelStyle}>Type</Text>
                <Text style={styles.valueStyle}>{safeText(profile.type)}</Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.labelStyle}>Major</Text>
                <Text style={styles.valueStyle}>{safeText(profile.major) || 'Not specified'}</Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.labelStyle}>Institution</Text>
                <Text style={styles.valueStyle}>{safeText(profile.institution) || 'Not specified'}</Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </LinearGradient>

        {/* 编辑模式显示保存按钮 - 修正显示逻辑 */}
        {(isEditingName || isEditingIntroduction) && (
          <TouchableOpacity 
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        )}

        {/* 用户名编辑Modal */}
        <Modal visible={isEditingName} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Username</Text>
                <TouchableOpacity onPress={handleNameCancel}>
                  <Text style={styles.modalCloseButton}>Cancel</Text>
                </TouchableOpacity>
              </View>
              
              <View style={{ paddingHorizontal: 20, paddingVertical: 15 }}>
                <TextInput
                  style={styles.modalInput}
                  value={safeText(tempName)}
                  onChangeText={setTempName}
                  placeholder="Enter username"
                  autoFocus
                />
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancelButton} onPress={handleNameCancel}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSaveButton} onPress={handleNameSave}>
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* 介绍编辑Modal - 优化显示 */}
        <Modal visible={isEditingIntroduction} transparent animationType="slide">
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Introduction</Text>
                <TouchableOpacity onPress={handleIntroductionCancel}>
                  <Text style={styles.modalCloseButton}>Cancel</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                style={styles.modalBody}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  value={safeText(tempIntroduction)}
                  onChangeText={setTempIntroduction}
                  placeholder="Enter introduction"
                  multiline
                  numberOfLines={4}
                  autoFocus
                  maxLength={200}
                />
                <Text style={styles.characterCount}>
                  {`${safeText(tempIntroduction).length}/200`}
                </Text>
              </ScrollView>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancelButton} onPress={handleIntroductionCancel}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSaveButton} onPress={handleIntroductionSave}>
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* 学校选择Modal - 修复文本渲染问题 */}
        <Modal visible={showSchoolPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.schoolModalContent}>
              <View style={styles.schoolModalHeader}>
                <Text style={styles.schoolModalTitle}>Select University</Text>
                <TouchableOpacity onPress={() => setShowSchoolPicker(false)}>
                  <Text style={styles.modalCloseButton}>Done</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                style={styles.schoolScrollView}
                showsVerticalScrollIndicator={false}
              >
                {HK_UNIVERSITIES.map((school, index) => {
                  console.log(`Rendering university ${index}:`, school);
                  return (
                    <TouchableOpacity
                      key={school.id}
                      style={[
                        styles.schoolItemRow,
                        profile.school === school.shortName && styles.schoolItemRowSelected
                      ]}
                      onPress={() => handleSchoolSelect(school)}
                    >
                      <View style={styles.schoolItemContent}>
                        <View style={styles.schoolItemTextContainer}>
                          <Text style={styles.schoolItemTitle}>{safeText(school.shortName)}</Text>
                          <Text style={styles.schoolItemSubtitle}>{safeText(school.name)}</Text>
                        </View>
                        {profile.school === school.shortName && (
                          <View style={styles.schoolCheckmark}>
                            <Text style={styles.schoolCheckmarkText}>✓</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* 类型选择Modal - 同样修复 */}
        <Modal visible={showTypePicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Type</Text>
                <TouchableOpacity onPress={() => setShowTypePicker(false)}>
                  <Text style={styles.modalCloseButton}>Cancel</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalScrollView}>
                {DEGREE_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={styles.modalOption}
                    onPress={() => handleTypeSelect(type)}
                  >
                    <View style={styles.modalOptionContent}>
                      <Text style={styles.modalOptionTitle}>{safeText(type.name)}</Text>
                      <View style={[
                        styles.radioButton,
                        profile.type === type.name && styles.radioButtonSelected
                      ]}>
                        {profile.type === type.name && (
                          <View style={styles.radioButtonInner} />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
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
  
  // 渐变背景
  gradientBackground: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  scrollContentContainer: {
    paddingTop: 10,
    paddingBottom: 80, // 为保存按钮留出空间
  },

  // 通用卡片样式
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 18,
    marginVertical: 10,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 12,
    elevation: 8,
  },
  
  // 区块行样式
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 12,
  },
  
  // 标签样式
  labelStyle: {
    fontSize: 14,
    color: '#9CA3AF',
    width: 100,
  },
  
  // 值样式
  valueStyle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    textAlign: 'right',
  },
  
  // 头像卡片
  photoSection: {
    alignItems: 'center',
    paddingVertical: 20,
    height: 160,
    justifyContent: 'center',
  },
  
  photoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF6B9D',
  },
  
  // 编辑图标 - 放在头像右下角
  editPhotoIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  editIcon: {
    width: 20,
    height: 20,
  },
  
  // Verified 徽章
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    gap: 8,
  },
  
  verifiedBadge: {
    backgroundColor: '#0A66C2',
    borderRadius: 2,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  
  verifiedText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  
  // Introduction 特殊样式 - 修改为不加粗，限制两行
  introValue: {
    fontSize: 15,
    fontWeight: '400', // 改为普通字重，不加粗
    color: '#0F172A',
    flex: 1,
    textAlign: 'right',
    lineHeight: 20,
  },
  
  // 分组标题
  sectionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
    marginVertical: 8,
    paddingHorizontal: 18,
  },
  
  // 箭头
  arrow: {
    color: '#CBD5E1',
    fontSize: 18,
    fontWeight: '300',
  },
  
  // 编辑模式保存按钮
  saveButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#4A90E2',
    shadowOpacity: 0.3,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,
    elevation: 5,
  },
  
  saveButtonDisabled: {
    opacity: 0.6,
  },
  
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  bottomSpacer: {
    height: 30,
  },
  
  // 加载状态
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  
  // Modal基础样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  
  // 通用Modal内容
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%', // 限制最大高度
    minHeight: 300, // 设置最小高度
  },
  
  // Modal头部
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  
  // Modal标题
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#475569',
  },
  
  // Modal关闭按钮
  modalCloseButton: {
    fontSize: 16,
    color: '#0A66C2',
    fontWeight: '600',
  },
  
  // Modal滚动视图
  modalScrollView: {
    paddingHorizontal: 20,
  },
  
  // Modal输入区域 - 优化键盘适配
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    maxHeight: 200, // 限制最大高度，避免键盘遮挡
  },
  
  modalInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#475569',
    marginBottom: 8,
  },
  
  modalTextArea: {
    height: 120, // 稍微增加高度
    textAlignVertical: 'top',
  },
  
  // 字符计数器
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginBottom: 8,
  },
  
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  
  modalCancelButton: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  
  modalCancelText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  modalSaveButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // 学校选择Modal特定样式 - 修复高度和留白问题
  schoolModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '70%',
    paddingTop: 20,
    marginBottom: 0, // 改为0，移除底部间距
    flex: 0,
  },
  
  schoolModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  
  schoolModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  
  schoolScrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  schoolItemRow: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  
  schoolItemRowSelected: {
    backgroundColor: '#F0F8FF',
  },
  
  schoolItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  schoolItemTextContainer: {
    flex: 1,
  },
  
  schoolItemTitle: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 20,
    fontWeight: '600', // 缩写用粗体，与FilterScreen一致
    marginBottom: 2, // 添加间距
  },
  
  schoolItemSubtitle: {
    fontSize: 14, // 改为14px，与FilterScreen一致
    color: '#ACB1C6', // 改为与FilterScreen一致的颜色
    fontWeight: '400',
  },
  
  schoolCheckmark: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  schoolCheckmarkText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  // Type选择器选项样式
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  
  modalOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ACB1C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  radioButtonSelected: {
    borderColor: '#0A66C2',
  },
  
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0A66C2',
  },
});