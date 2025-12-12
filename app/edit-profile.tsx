import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
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

const MAJOR_OPTIONS = [
  {
    faculty: 'Faculty of Arts',
    majors: [
      { id: 'anthropology', name: 'Anthropology' },
      { id: 'bimodal-bilingual', name: 'Bimodal Bilingual Studies' },
      { id: 'chinese-lang-lit', name: 'Chinese Language and Literature' },
      { id: 'chinese-studies', name: 'Chinese Studies' },
      { id: 'english', name: 'English' },
      { id: 'fine-arts', name: 'Fine Arts' },
      { id: 'history', name: 'History' },
      { id: 'japanese', name: 'Japanese Studies' },
      { id: 'linguistics', name: 'Linguistics' },
      { id: 'music', name: 'Music' },
      { id: 'philosophy', name: 'Philosophy' },
      { id: 'public-history', name: 'Public History' },
      { id: 'public-humanities', name: 'Public Humanities' },
      { id: 'religious-studies', name: 'Religious Studies' },
      { id: 'theology', name: 'Theology' },
      { id: 'translation', name: 'Translation' },
    ]
  },
  {
    faculty: 'Faculty of Business',
    majors: [
      { id: 'global-business', name: 'Global Business Studies' },
      { id: 'biotech-entrepreneurship', name: 'Biotechnology, Entrepreneurship and Healthcare Management' },
      { id: 'integrated-bba', name: 'Integrated BBA Programme' },
      { id: 'global-economics', name: 'Global Economics and Finance' },
      { id: 'prof-accountancy', name: 'Professional Accountancy' },
      { id: 'hospitality-realestate', name: 'Hospitality and Real Estate' },
      { id: 'quantitative-finance', name: 'Quantitative Finance' },
      { id: 'hotel-tourism', name: 'Hotel and Tourism Management' },
      { id: 'insurance-finance', name: 'Insurance, Financial and Actuarial Analysis' },
      { id: 'bba-jd', name: 'BBA(IBBA)-JD Double Degree Programme' },
      { id: 'quant-risk', name: 'Quantitative Finance and Risk Management Science' },
    ]
  },
  {
    faculty: 'Faculty of Education',
    majors: [
      { id: 'chinese-lang-ed', name: 'Chinese Language Studies (BA) and Chinese Language Education (BEd)' },
      { id: 'early-childhood', name: 'Early Childhood Education' },
      { id: 'english-lang-ed', name: 'English Studies (BA) and English Language Education (BEd)' },
      { id: 'exercise-science', name: 'Exercise Science and Health Education' },
      { id: 'human-movement', name: 'Human Movement Science and Health Studies' },
      { id: 'learning-design-tech', name: 'Learning Design and Technology' },
      { id: 'math-education', name: 'Mathematics and Mathematics Education' },
      { id: 'physical-ed', name: 'Physical Education, Exercise Science and Health' },
    ]
  },
  {
    faculty: 'Faculty of Engineering',
    majors: [
      { id: 'aerospace-earth', name: 'Aerospace Science and Earth Informatics & X Double Major Programme' },
      { id: 'ai-systems', name: 'Artificial Intelligence: Systems and Technologies' },
      { id: 'biomedical-eng', name: 'Biomedical Engineering' },
      { id: 'comp-data-science', name: 'Computational Data Science' },
      { id: 'comp-engineering', name: 'Computer Engineering' },
      { id: 'comp-science', name: 'Computer Science' },
      { id: 'comp-sci-eng', name: 'Computer Science and Engineering' },
      { id: 'electronic-eng', name: 'Electronic Engineering' },
      { id: 'energy-env-eng', name: 'Energy and Environmental Engineering' },
      { id: 'fintech', name: 'Financial Technology' },
      { id: 'info-engineering', name: 'Information Engineering' },
      { id: 'materials-eng', name: 'Materials Science and Engineering' },
      { id: 'math-info-eng', name: 'Mathematics and Information Engineering' },
      { id: 'mech-automation', name: 'Mechanical and Automation Engineering' },
      { id: 'systems-eng', name: 'Systems Engineering and Engineering Management' },
    ]
  },
  {
    faculty: 'Faculty of Law',
    majors: [
      { id: 'law', name: 'Laws' },
      { id: 'bba-jd-law', name: 'BBA(IBBA)-JD Double Degree Programme' },
    ]
  },
  {
    faculty: 'Faculty of Medicine',
    majors: [
      { id: 'biomedical-sci', name: 'Biomedical Sciences' },
      { id: 'chinese-medicine', name: 'Chinese Medicine' },
      { id: 'community-health', name: 'Community Health Practice' },
      { id: 'gerontology', name: 'Gerontology' },
      { id: 'medicine', name: 'Medicine (MBChB) Programme' },
      { id: 'medicine-gps', name: 'Medicine (MBChB) Programme Global Physician-Leadership Stream (GPS)' },
      { id: 'nursing', name: 'Nursing' },
      { id: 'pharmacy', name: 'Pharmacy' },
      { id: 'public-health', name: 'Public Health' },
    ]
  },
  {
    faculty: 'Faculty of Science',
    majors: [
      { id: 'earth-env-sciences', name: 'Earth and Environmental Sciences' },
      { id: 'enrichment-math', name: 'Enrichment Mathematics' },
      { id: 'theoretical-physics', name: 'Enrichment Stream in Theoretical Physics' },
      { id: 'natural-sciences', name: 'Natural Sciences' },
      { id: 'risk-mgmt-science', name: 'Risk Management Science' },
      { id: 'science', name: 'Science' },
    ]
  },
  {
    faculty: 'Faculty of Social Science',
    majors: [
      { id: 'architectural', name: 'Architectural Studies' },
      { id: 'economics', name: 'Economics' },
      { id: 'data-policy', name: 'Data Science and Policy Studies' },
      { id: 'economics-dual', name: 'Economics (CUHK–Tsinghua University Dual Undergraduate Degree Programme)' },
      { id: 'gender-studies', name: 'Gender Studies' },
      { id: 'geography-resource', name: 'Geography and Resource Management' },
      { id: 'global-comm', name: 'Global Communication' },
      { id: 'global-studies', name: 'Global Studies' },
      { id: 'govt-public-admin', name: 'Government and Public Administration' },
      { id: 'journalism-comm', name: 'Journalism and Communication' },
      { id: 'psychology', name: 'Psychology' },
      { id: 'social-science', name: 'Social Science (Broad-based)' },
      { id: 'social-work', name: 'Social Work' },
      { id: 'society-sustainable', name: 'Society and Sustainable Development' },
      { id: 'sociology', name: 'Sociology' },
      { id: 'urban-studies', name: 'Urban Studies' },
    ]
  },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [formData, setFormData] = useState({
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

  const [showSchoolPicker, setShowSchoolPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showMajorPicker, setShowMajorPicker] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  useLayoutEffect(() => {}, [hasUnsavedChanges, saving]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (token) {
        console.log('Loading user profile for editing...');
        const result = await getUserProfile(token);
        
        if (result.success && result.data) {
          console.log('Profile loaded successfully:', result.data);
          
          setFormData({
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
          setFormData({
            id: '12345678',
            username: 'Alice',
            email: 'alice@example.com',
            real_name: 'Alice Wang',
            avatar: '',
            verification: 'CUHK',
            introduction: 'A year-3 student studying xxx in CUHK. Be interested in XXX',
            school: 'CUHK',
            type: 'Undergraduate',
            major: '',
            institution: '',
          });
        }
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
    }, [])
  );

  const handleSave = async () => {
    if (!hasUnsavedChanges) return;
    
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (token) {
        console.log('Updating user profile:', formData);
        
        const updateData: Partial<UserProfile> = {
          username: formData.username,
          real_name: formData.real_name,
          introduction: formData.introduction,
          school: formData.school,
          type: formData.type,
          major: formData.major,
          institution: formData.institution,
        };

        const result = await updateUserProfile(updateData, token);

        if (result.success) {
          await AsyncStorage.setItem('username', formData.username);
          setHasUnsavedChanges(false);
          Alert.alert('Success', 'Profile updated successfully!');
        } else {
          Alert.alert('Error', result.message || 'Failed to update profile');
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSchoolSelect = (school: any) => {
    handleChange('school', school.shortName);
    setShowSchoolPicker(false);
  };

  const handleTypeSelect = (type: any) => {
    handleChange('type', type.name);
    setShowTypePicker(false);
  };

  const handleMajorSelect = (majorId: string, majorName: string) => {
    handleChange('major', majorName);
    setShowMajorPicker(false);
    setSelectedFaculty('');
  };

  const getMajorDisplayName = (majorValue: string): string => {
    if (!majorValue) return 'Not specified';
    
    for (const facultyGroup of MAJOR_OPTIONS) {
      const major = facultyGroup.majors.find(m => m.name === majorValue);
      if (major) return major.name;
    }
    
    for (const facultyGroup of MAJOR_OPTIONS) {
      const major = facultyGroup.majors.find(m => m.id === majorValue);
      if (major) return major.name;
    }
    
    return majorValue;
  };

  const renderInputRow = (
    label: string, 
    fieldKey: keyof typeof formData, 
    placeholder: string, 
    multiline = false
  ) => (
    <View style={[styles.menuItem, multiline && { alignItems: 'flex-start' }]}>
      <Text style={[styles.labelStyle, multiline && { marginTop: 12 }]}>{label}</Text>
      <TextInput
        style={[
          styles.inputStyle, 
          multiline && styles.multilineInput
        ]}
        value={formData[fieldKey]}
        onChangeText={(text) => handleChange(fieldKey, text)}
        placeholder={placeholder}
        placeholderTextColor="#CBD5E1"
        multiline={multiline}
        clearButtonMode="while-editing"
        maxLength={multiline ? 200 : 50}
      />
    </View>
  );

  const renderSelectorRow = (
    label: string, 
    value: string, 
    onPress: () => void,
    displayValue?: string
  ) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.labelStyle}>{label}</Text>
      <Text style={[styles.valueStyle, !value && { color: '#CBD5E1' }]}>
        {displayValue || value || 'Not specified'}
      </Text>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaProvider>
        <Stack.Screen options={{ 
          headerShown: true,
          title: 'Profile',
          headerBackTitle: 'Back'
        }} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Edit Profile',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: '#F8F9FA' },
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleSave} 
              disabled={!hasUnsavedChanges || saving}
              style={[
                styles.headerButton,
                (!hasUnsavedChanges || saving) && styles.headerButtonDisabled
              ]}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#0A66C2" />
              ) : (
                <Text style={[
                  styles.headerButtonText,
                  hasUnsavedChanges && styles.headerButtonTextActive
                ]}>
                  Done
                </Text>
              )}
            </TouchableOpacity>
          )
        }} 
      />
      
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <LinearGradient
            colors={['#F8F9FA', '#FFFFFF']}
            style={styles.gradientBackground}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.avatarSection}>
                <Image
                  source={{
                    uri: formData.avatar || "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/1d39bdc7-8fd1-469d-802d-e6f3e2c968cd"
                  }}
                  style={styles.avatar}
                />
                <TouchableOpacity style={styles.changeAvatarBtn}>
                  <Text style={styles.changeAvatarText}>Change Avatar</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.card}>
                {renderInputRow("Username", "username", "Enter username")}
                
                <View style={styles.divider} />
                
                <View style={styles.menuItem}>
                  <Text style={styles.labelStyle}>User ID</Text>
                  <Text style={[styles.valueStyle, { color: '#94A3B8' }]}>{formData.id}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.menuItem}>
                  <Text style={styles.labelStyle}>Verification</Text>
                  <View style={styles.verificationContainer}>
                    <Text style={styles.valueStyle}>{formData.verification}</Text>
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                {renderInputRow("Introduction", "introduction", "Tell us about yourself...", true)}
                <View style={styles.characterCount}>
                  <Text style={styles.characterCountText}>
                    {formData.introduction.length}/200
                  </Text>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionHeader}>DETAILED INFORMATION</Text>
                
                {renderSelectorRow("University", formData.school, () => setShowSchoolPicker(true))}
                <View style={styles.divider} />
                
                {renderSelectorRow("Type", formData.type, () => setShowTypePicker(true))}
                <View style={styles.divider} />
                
                {renderSelectorRow(
                  "Major", 
                  formData.major, 
                  () => setShowMajorPicker(true),
                  getMajorDisplayName(formData.major)
                )}
                <View style={styles.divider} />
                
                <View style={styles.menuItem}>
                  <Text style={styles.labelStyle}>Institution</Text>
                  <Text style={styles.valueStyle}>{formData.institution || 'Not specified'}</Text>
                </View>
              </View>

              <View style={styles.bottomSpacer} />
            </ScrollView>
          </LinearGradient>
        </KeyboardAvoidingView>

        <Modal visible={showSchoolPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select University</Text>
                <TouchableOpacity onPress={() => setShowSchoolPicker(false)}>
                  <Text style={styles.pickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                {HK_UNIVERSITIES.map((school, index) => (
                  <TouchableOpacity
                    key={school.id}
                    style={[
                      styles.pickerItem,
                      formData.school === school.shortName && styles.pickerItemSelected
                    ]}
                    onPress={() => handleSchoolSelect(school)}
                  >
                    <View style={styles.pickerItemContent}>
                      <View>
                        <Text style={styles.pickerItemTitle}>{school.shortName}</Text>
                        <Text style={styles.pickerItemSubtitle}>{school.name}</Text>
                      </View>
                      {formData.school === school.shortName && (
                        <View style={styles.checkmark}>
                          <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal visible={showTypePicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Type</Text>
                <TouchableOpacity onPress={() => setShowTypePicker(false)}>
                  <Text style={styles.pickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                {DEGREE_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.pickerItem,
                      formData.type === type.name && styles.pickerItemSelected
                    ]}
                    onPress={() => handleTypeSelect(type)}
                  >
                    <View style={styles.pickerItemContent}>
                      <Text style={styles.pickerItemTitle}>{type.name}</Text>
                      {formData.type === type.name && (
                        <View style={styles.checkmark}>
                          <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal visible={showMajorPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => {
                  if (selectedFaculty) {
                    setSelectedFaculty('');
                  } else {
                    setShowMajorPicker(false);
                  }
                }}>
                  <Text style={styles.pickerDone}>
                    {selectedFaculty ? '← Back' : 'Cancel'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.pickerTitle}>
                  {selectedFaculty || 'Select Major'}
                </Text>
                <TouchableOpacity onPress={() => {
                  setShowMajorPicker(false);
                  setSelectedFaculty('');
                }}>
                  <Text style={styles.pickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                {!selectedFaculty ? (
                  MAJOR_OPTIONS.map((facultyGroup) => (
                    <TouchableOpacity
                      key={facultyGroup.faculty}
                      style={styles.pickerItem}
                      onPress={() => setSelectedFaculty(facultyGroup.faculty)}
                    >
                      <View style={styles.pickerItemContent}>
                        <Text style={styles.pickerItemTitle}>{facultyGroup.faculty}</Text>
                        <Text style={styles.arrow}>›</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  MAJOR_OPTIONS
                    .find(f => f.faculty === selectedFaculty)
                    ?.majors.map((major) => (
                      <TouchableOpacity
                        key={major.id}
                        style={[
                          styles.pickerItem,
                          formData.major === major.name && styles.pickerItemSelected
                        ]}
                        onPress={() => handleMajorSelect(major.id, major.name)}
                      >
                        <View style={styles.pickerItemContent}>
                          <Text style={styles.pickerItemSubtitle}>{major.name}</Text>
                          {formData.major === major.name && (
                            <View style={styles.checkmark}>
                              <Text style={styles.checkmarkText}>✓</Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))
                )}
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
    backgroundColor: '#F8F9FA',
  },
  
  gradientBackground: {
    flex: 1,
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
    marginTop: 12,
    fontSize: 16,
    color: '#9CA3AF',
  },

  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  headerButtonDisabled: {
    opacity: 0.3,
  },

  headerButtonText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  },

  headerButtonTextActive: {
    color: '#0A66C2',
  },

  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF6B9D',
  },
  
  changeAvatarBtn: {
    marginTop: 12,
  },
  
  changeAvatarText: {
    color: '#0A66C2',
    fontWeight: '600',
    fontSize: 14,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 56,
  },

  labelStyle: {
    width: 100,
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },

  inputStyle: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
    padding: 0,
    textAlign: 'right',
  },

  multilineInput: {
    textAlign: 'left',
    minHeight: 80,
    textAlignVertical: 'top',
    marginRight: 16,
  },

  valueStyle: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
    textAlign: 'right',
  },

  arrow: {
    marginLeft: 8,
    color: '#CBD5E1',
    fontSize: 20,
    fontWeight: '300',
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2E8F0',
    marginLeft: 16,
  },

  characterCount: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    alignItems: 'flex-end',
  },

  characterCountText: {
    fontSize: 12,
    color: '#94A3B8',
  },

  sectionHeader: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    marginLeft: 16,
    marginTop: 12,
    marginBottom: 4,
    letterSpacing: 0.5,
  },

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
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  
  verifiedText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  bottomSpacer: {
    height: 30,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },

  pickerModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },

  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },

  pickerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0F172A',
  },

  pickerDone: {
    fontSize: 16,
    color: '#0A66C2',
    fontWeight: '600',
  },

  pickerItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },

  pickerItemSelected: {
    backgroundColor: '#F0F8FF',
  },

  pickerItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  pickerItemTitle: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
  },

  pickerItemSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },

  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0A66C2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});