import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// 导入API函数
import { sendPost, uploadImage, type PostData } from '@/services/api';
import { stripHashtags } from '@/utils/tags';

// 图标组件
const TagIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"
      fill="#ACB1C6"
    />
  </Svg>
);

const UserIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      fill="#ACB1C6"
    />
  </Svg>
);

const ExpandIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"
      fill="#ACB1C6"
    />
  </Svg>
);

const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
      fill="#475569"
    />
  </Svg>
);

const FilterIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M3 6h2m4 0h12M9 12H7m10 0H9m-2 6h4m4 0h4"
      stroke="#64748B"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const ArrowRightIcon = () => (
  <Svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"
      fill="#ACB1C6"
    />
  </Svg>
);

const LightningIcon = ({ size = 16, color = "#FFFFFF" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M13 3v8h7l-10 10V13H3l10-10z"
      fill={color}
    />
  </Svg>
);

const DeleteIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M6 6l12 12M6 18L18 6"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const AddImageIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M12 5v14m7-7H5"
      stroke="#ACB1C6"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const DownArrowIcon = () => (
  <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"
      fill="#ACB1C6"
    />
  </Svg>
);

const CollapseIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"
      fill="#ACB1C6"
    />
  </Svg>
);

// 语言文本
const text = {
  EN: {
    targetedPost: 'Targeted Post',
    send: 'Send',
    cancel: 'Cancel',
    title: 'Title',
    content: 'Content...',
    tags: 'Tags',
    user: 'User',
    expand: 'Full Screen',
    collapse: 'Collapse',
    publishSuccess: 'Post published successfully!',
    publishFailed: 'Failed to publish post',
    contentRequired: 'Content is required',
    publishing: 'Publishing...',
    setTargetGroup: 'Set Target Group',
    currentBalance: 'Current Balance:',
    estimatedCost: 'Estimated Cost:',
    balanceAfterSend: 'Balance After Send:',
    publishMessage: 'Publish Message',
  },
  CN: {
    targetedPost: '定向信息',
    send: '发送',
    cancel: '取消',
    title: '标题',
    content: '如果需要回复，请记得留下你的联系方式喔！',
    tags: '标签',
    user: '用户',
    expand: '全屏',
    collapse: '收起',
    publishSuccess: '帖子发布成功！',
    publishFailed: '发布失败',
    contentRequired: '请输入内容',
    publishing: '发布中...',
    setTargetGroup: '设置目标群体',
    currentBalance: '当前余额:',
    estimatedCost: '预计消耗:',
    balanceAfterSend: '发送后余额:',
    publishMessage: '发布消息',
  }
};

const { width: screenWidth } = Dimensions.get('window');
const imageSize = (screenWidth - 80) / 3;

// 学校和类型选择选项
const schoolOptions = [
  { id: 'cuhk', name: 'CUHK', fullName: 'Chinese University of Hong Kong' },
  { id: 'hku', name: 'HKU', fullName: 'University of Hong Kong' },
  { id: 'hkust', name: 'HKUST', fullName: 'Hong Kong University of Science and Technology' },
  { id: 'cityu', name: 'CityU', fullName: 'City University of Hong Kong' },
  { id: 'polyu', name: 'PolyU', fullName: 'Hong Kong Polytechnic University' },
  { id: 'hkbu', name: 'HKBU', fullName: 'Hong Kong Baptist University' },
  { id: 'lingnan', name: 'Lingnan', fullName: 'Lingnan University' },
  { id: 'eduhk', name: 'EdUHK', fullName: 'Education University of Hong Kong' },
];

const typeOptions = [
  { id: 'undergraduate', name: 'Undergraduate', description: 'Bachelor degree students' },
  { id: 'postgraduate', name: 'Postgraduate', description: 'Master and PhD students' },
  { id: 'faculty', name: 'Faculty', description: 'Teaching staff and professors' },
  { id: 'staff', name: 'Staff', description: 'Administrative and support staff' },
  { id: 'alumni', name: 'Alumni', description: 'Graduates and former students' },
];

// 专业选项（只显示英文）
const majorOptions = [
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

// 主组件
export default function PostScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState<'EN' | 'CN'>('CN'); // 默认中文
  const [isPublishing, setIsPublishing] = useState(false);
  
  // 图片相关状态
  const [images, setImages] = useState<string[]>([]);
  const [isEditingImages, setIsEditingImages] = useState(false);

  // 目标群体选择状态
  const [showTargetFilter, setShowTargetFilter] = useState(false);
  const [showSchoolSelector, setShowSchoolSelector] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showMajorSelector, setShowMajorSelector] = useState(false);
  
  const [selectedSchools, setSelectedSchools] = useState<string[]>(['cuhk', 'hku', 'hkust']);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['undergraduate']);
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');

  // 数值输入状态
  const [targetViewers, setTargetViewers] = useState<number>(100);
  const [targetReadingTime, setTargetReadingTime] = useState<number>(30);

  // 余额相关状态
  const [currentBalance, setCurrentBalance] = useState<number>(2000);
  
  // 展开状态
  const [isExpanded, setIsExpanded] = useState(false);

  // 内容输入框引用
  const contentInputRef = useRef<TextInput>(null);

  // 获取语言设置
  useFocusEffect(
    useCallback(() => {
      const getLanguage = async () => {
        try {
          const savedLanguage = await AsyncStorage.getItem('language');
          if (savedLanguage === 'CN' || savedLanguage === 'EN') {
            setLanguage(savedLanguage);
          }
        } catch (error) {
          console.error('Failed to get language', error);
        }
      };
      getLanguage();
    }, [])
  );

  const t = text[language];

  // 计算推荐的观看人数范围
  const calculateRecommendedViewers = () => {
    let baseCount = 1; // 基础人数
    
    // 每个学校增加基础人数
    const schoolMultiplier = selectedSchools.length;
    baseCount = baseCount * schoolMultiplier * 2;
    
    // 每个类型增加1.5-2倍
    const typeMultiplier = selectedTypes.length;
    baseCount = baseCount * typeMultiplier * 1.75; // 取中间值1.75
    
    // 每个专业增加10-15人
    const majorCount = selectedMajors.length;
    const majorAddition = majorCount * 12.5; // 取中间值12.5
    
    const total = Math.round(baseCount + majorAddition);
    const min = Math.round(total * 0.85); // -15%
    const max = Math.round(total * 1.15); // +15%
    
    return { min, max, suggested: total };
  };

  // 计算能量消耗
  const calculateEnergyCost = () => {
    const totalMinutes = targetReadingTime / 60; // 转换为分钟
    const energy = targetViewers * totalMinutes;
    return Math.round(energy * 100) / 100; // 保留两位小数
  };

  // 计算发送后余额
  const getBalanceAfterSend = () => {
    const cost = calculateEnergyCost();
    return Math.max(0, currentBalance - cost);
  };

  // 获取选中学校的显示文本
  const getSelectedSchoolsText = () => {
    if (selectedSchools.length === 0) return '';
    if (selectedSchools.length === schoolOptions.length) return 'All Schools';
    const names = selectedSchools.map(id => schoolOptions.find(s => s.id === id)?.name).filter(Boolean);
    return names.join(', ');
  };

  // 获取选中类型的显示文本
  const getSelectedTypesText = () => {
    if (selectedTypes.length === 0) return '';
    if (selectedTypes.length === typeOptions.length) return 'All Types';
    const names = selectedTypes.map(id => typeOptions.find(t => t.id === id)?.name).filter(Boolean);
    return names.join(', ');
  };

  // 获取选中专业的显示文本
  const getSelectedMajorsText = () => {
    if (selectedMajors.length === 0) return '';
    if (selectedMajors.length > 2) return `${selectedMajors.length} majors selected`;
    return selectedMajors.map(id => {
      for (const facultyGroup of majorOptions) {
        const major = facultyGroup.majors.find(m => m.id === id);
        if (major) return major.name;
      }
      return '';
    }).filter(Boolean).join(', ');
  };

  // 处理学校选择
  const handleSchoolToggle = (schoolId: string) => {
    setSelectedSchools(prev => 
      prev.includes(schoolId)
        ? prev.filter(id => id !== schoolId)
        : [...prev, schoolId]
    );
  };

  // 处理类型选择
  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  // 处理专业选择
  const handleMajorToggle = (majorId: string) => {
    setSelectedMajors(prev => 
      prev.includes(majorId)
        ? prev.filter(id => id !== majorId)
        : [...prev, majorId]
    );
  };

  const handlePublish = async () => {
    if (!content.trim()) {
      if (Platform.OS === 'web') {
        window.alert(t.contentRequired);
      } else {
        Alert.alert('Error', t.contentRequired);
      }
      return;
    }

    setIsPublishing(true);
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        if (Platform.OS === 'web') {
          window.alert('Please login first');
        } else {
          Alert.alert('Error', 'Please login first');
        }
        return;
      }

      let imageUrl: string | undefined = undefined;
      
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const uploadResult = await uploadImage(images[i], token);
          if (uploadResult.success && uploadResult.data?.key) {
            imageUrl = uploadResult.data.key;
            break;
          }
        }
      }

      let finalTitle: string;
      if (title.trim()) {
        finalTitle = title.trim();
      } else {
        const cleanContent = stripHashtags(content);
        finalTitle = cleanContent.trim().substring(0, 6) || 'Untitled';
      }

      const cleanContent = stripHashtags(content);

      const postData: PostData = {
        title: finalTitle,
        content: cleanContent,
        image_url: imageUrl || "",
        ref: "targeted",
        real_name: false,
        tags: '',
        type: "targeted",
      };

      const result = await sendPost(postData, token);

      if (result.success) {
        setTitle('');
        setContent('');
        setImages([]);

        if (Platform.OS === 'web') {
          window.alert(t.publishSuccess);
          window.location.href = window.location.origin + '/';
        } else {
          Alert.alert('Success', t.publishSuccess, [
            {
              text: 'OK',
              onPress: () => {
                try {
                  router.replace('/');
                } catch (error) {
                  router.push('/');
                }
              }
            }
          ]);
        }
      } else {
        if (Platform.OS === 'web') {
          window.alert(result.message || t.publishFailed);
        } else {
          Alert.alert('Error', result.message || t.publishFailed);
        }
      }
    } catch (error) {
      console.error('Error publishing post:', error);
      if (Platform.OS === 'web') {
        window.alert('Network error. Please try again.');
      } else {
        Alert.alert('Error', 'Network error. Please try again.');
      }
    } finally {
      setIsPublishing(false);
    }
  };

  // 请求相册权限
  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photo library');
      return false;
    }
    return true;
  };

  // 选择图片
  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...newImages].slice(0, 9));
    }
  };

  // 删除图片
  const deleteImage = (index: number) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setImages(prev => prev.filter((_, i) => i !== index));
            setIsEditingImages(false);
          }
        }
      ]
    );
  };

  // 长按图片进入编辑模式
  const onLongPress = () => {
    setIsEditingImages(true);
  };

  // 渲染专业选择器
  const renderMajorSelector = () => (
    <View style={styles.inlineFilterContainer}>
      <View style={styles.inlineFilterHeader}>
        <TouchableOpacity onPress={() => {
          if (selectedFaculty) {
            setSelectedFaculty('');
          } else {
            setShowMajorSelector(false);
          }
        }}>
          <Text style={styles.inlineFilterBack}>
            {selectedFaculty ? '← Back' : '← Back'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.inlineFilterTitle}>
          {selectedFaculty || 'Select Major'}
        </Text>
        <TouchableOpacity onPress={() => {
          setShowMajorSelector(false);
          setSelectedFaculty('');
        }}>
          <Text style={styles.inlineFilterDone}>Done</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.inlineFilterContent} showsVerticalScrollIndicator={false}>
        {!selectedFaculty ? (
          majorOptions.map((facultyGroup, index) => (
            <TouchableOpacity
              key={facultyGroup.faculty}
              style={[
                styles.filterItem,
                index === majorOptions.length - 1 && styles.filterItemLast
              ]}
              onPress={() => setSelectedFaculty(facultyGroup.faculty)}
            >
              <View style={styles.filterItemContent}>
                <Text style={styles.filterItemName}>{facultyGroup.faculty}</Text>
                <DownArrowIcon />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          majorOptions
            .find(f => f.faculty === selectedFaculty)
            ?.majors.map((major, index, array) => (
              <TouchableOpacity
                key={major.id}
                style={[
                  styles.filterItem,
                  index === array.length - 1 && styles.filterItemLast
                ]}
                onPress={() => handleMajorToggle(major.id)}
              >
                <View style={styles.filterItemContent}>
                  <View style={styles.filterItemText}>
                    <Text style={styles.filterItemName}>{major.name}</Text>
                  </View>
                  <View style={[
                    styles.filterCheckbox,
                    selectedMajors.includes(major.id) && styles.filterCheckboxChecked
                  ]}>
                    {selectedMajors.includes(major.id) && (
                      <Text style={styles.filterCheckboxText}>✓</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
        )}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <BackIcon />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>{t.targetedPost}</Text>
          
          <View style={styles.energyBadge}>
            <LightningIcon size={14} color="#475569" />
            <Text style={styles.energyBadgeText}>{Math.round(calculateEnergyCost())}</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Title Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>{t.title}</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="请输入标题"
              placeholderTextColor="#ACB1C6"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              editable={!isPublishing}
            />
          </View>

          {/* Content Input */}
          <TextInput
            ref={contentInputRef}
            style={[styles.contentInput, isExpanded && styles.expandedContentInput]}
            placeholder={t.content}
            placeholderTextColor="#ACB1C6"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={isExpanded ? 15 : 8}
            textAlignVertical="top"
            maxLength={1000}
            editable={!isPublishing}
          />

          {/* Full Screen Button */}
          <View style={styles.expandButtonContainer}>
            <TouchableOpacity 
              style={styles.expandButton}
              onPress={() => setIsExpanded(!isExpanded)}
            >
              <ExpandIcon />
              <Text style={styles.expandButtonText}>{t.expand}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Image Upload */}
        <View style={styles.imageSection}>
          {images.length === 0 ? (
            <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
              <View style={styles.addImagePlus}>
                <View style={styles.addImagePlusH} />
                <View style={styles.addImagePlusV} />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.imageGridContainer}>
              {images.map((uri, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.imageContainer}
                  onLongPress={onLongPress}
                  delayLongPress={2000}
                >
                  <Image source={{ uri }} style={styles.uploadedImage} resizeMode="cover" />
                  {isEditingImages && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteImage(index)}
                    >
                      <View style={styles.deleteIcon}>
                        <DeleteIcon />
                      </View>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Set Target Group */}
        <TouchableOpacity 
          style={styles.targetGroupButton}
          onPress={() => setShowTargetFilter(true)}
        >
          <View style={styles.targetGroupLeft}>
            <View style={styles.filterIconContainer}>
              <FilterIcon />
            </View>
            <Text style={styles.targetGroupText}>{t.setTargetGroup}</Text>
          </View>
          <Text style={styles.arrowRight}>›</Text>
        </TouchableOpacity>

        {/* Balance Statistics */}
        <View style={styles.balanceSection}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>{t.currentBalance}</Text>
            <View style={styles.balanceValueContainer}>
              <LightningIcon size={16} color="#FBBF24" />
              <Text style={styles.balanceValueYellow}>{currentBalance}</Text>
            </View>
          </View>

          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>{t.estimatedCost}</Text>
            <View style={styles.balanceValueContainer}>
              <Text style={styles.balanceValueGrey}>{calculateEnergyCost()}</Text>
            </View>
          </View>

          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>{t.balanceAfterSend}</Text>
            <View style={styles.balanceValueContainer}>
              <LightningIcon size={16} color="#FBBF24" />
              <Text style={styles.balanceValueYellow}>{getBalanceAfterSend()}</Text>
            </View>
          </View>
        </View>

        {/* Publish Button */}
        <View style={styles.publishButtonContainer}>
          <TouchableOpacity 
            style={[styles.publishButton, isPublishing && styles.publishButtonDisabled]}
            onPress={handlePublish}
            disabled={isPublishing}
          >
            <LightningIcon size={18} color="#94A3B8" />
            <Text style={styles.publishButtonText}>{isPublishing ? t.publishing : t.publishMessage}</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Target Filter Modal */}
      <Modal
        visible={showTargetFilter}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTargetFilter(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            // 点击遮罩层关闭键盘
            contentInputRef.current?.blur();
          }}
        >
          <TouchableOpacity 
            style={styles.modalContentWrapper}
            activeOpacity={1}
            onPress={(e) => {
              // 阻止事件冒泡，点击内容区域不关闭键盘
              e.stopPropagation();
            }}
          >
            {showSchoolSelector ? (
              <View style={styles.inlineFilterContainer}>
                <View style={styles.inlineFilterHeader}>
                  <TouchableOpacity onPress={() => setShowSchoolSelector(false)}>
                    <Text style={styles.inlineFilterBack}>← Back</Text>
                  </TouchableOpacity>
                  <Text style={styles.inlineFilterTitle}>Select School</Text>
                  <TouchableOpacity onPress={() => setShowSchoolSelector(false)}>
                    <Text style={styles.inlineFilterDone}>Done</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.inlineFilterContent} showsVerticalScrollIndicator={false}>
                  {schoolOptions.map((school, index) => (
                    <TouchableOpacity
                      key={school.id}
                      style={[
                        styles.filterItem,
                        index === schoolOptions.length - 1 && styles.filterItemLast
                      ]}
                      onPress={() => handleSchoolToggle(school.id)}
                    >
                      <View style={styles.filterItemContent}>
                        <View style={styles.filterItemText}>
                          <Text style={styles.filterItemName}>{school.name}</Text>
                          <Text style={styles.filterItemDescription}>{school.fullName}</Text>
                        </View>
                        <View style={[
                          styles.filterCheckbox,
                          selectedSchools.includes(school.id) && styles.filterCheckboxChecked
                        ]}>
                          {selectedSchools.includes(school.id) && (
                            <Text style={styles.filterCheckboxText}>✓</Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : showTypeSelector ? (
              <View style={styles.inlineFilterContainer}>
                <View style={styles.inlineFilterHeader}>
                  <TouchableOpacity onPress={() => setShowTypeSelector(false)}>
                    <Text style={styles.inlineFilterBack}>← Back</Text>
                  </TouchableOpacity>
                  <Text style={styles.inlineFilterTitle}>Select Type</Text>
                  <TouchableOpacity onPress={() => setShowTypeSelector(false)}>
                    <Text style={styles.inlineFilterDone}>Done</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.inlineFilterContent} showsVerticalScrollIndicator={false}>
                  {typeOptions.map((type, index) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.filterItem,
                        index === typeOptions.length - 1 && styles.filterItemLast
                      ]}
                      onPress={() => handleTypeToggle(type.id)}
                    >
                      <View style={styles.filterItemContent}>
                        <View style={styles.filterItemText}>
                          <Text style={styles.filterItemName}>{type.name}</Text>
                          <Text style={styles.filterItemDescription}>{type.description}</Text>
                        </View>
                        <View style={[
                          styles.filterCheckbox,
                          selectedTypes.includes(type.id) && styles.filterCheckboxChecked
                        ]}>
                          {selectedTypes.includes(type.id) && (
                            <Text style={styles.filterCheckboxText}>✓</Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : showMajorSelector ? (
              renderMajorSelector()
            ) : (
              <View style={styles.modalContent}>
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.filtersSection}>
                    <Text style={styles.filtersTitle}>Filters</Text>

                    <TouchableOpacity
                      style={styles.filterRow}
                      onPress={() => setShowSchoolSelector(true)}
                    >
                      <Text style={styles.filterLabel}>School</Text>
                      <Text style={styles.filterValue} numberOfLines={1}>
                        {getSelectedSchoolsText()}
                      </Text>
                      <View style={styles.filterBadge}>
                        <Text style={styles.filterBadgeText}>{selectedSchools.length}</Text>
                      </View>
                      <DownArrowIcon />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.filterRow}
                      onPress={() => setShowTypeSelector(true)}
                    >
                      <Text style={styles.filterLabel}>Type</Text>
                      <Text style={styles.filterValue} numberOfLines={1}>
                        {getSelectedTypesText()}
                      </Text>
                      <View style={styles.filterBadge}>
                        <Text style={styles.filterBadgeText}>{selectedTypes.length}</Text>
                      </View>
                      <DownArrowIcon />
                    </TouchableOpacity>
                      
                    <TouchableOpacity
                      style={styles.filterRow}
                      onPress={() => setShowMajorSelector(true)}
                    >
                      <Text style={styles.filterLabel}>Major</Text>
                      <Text style={styles.filterValue} numberOfLines={1}>
                        {getSelectedMajorsText() || 'Select Major'}
                      </Text>
                      {selectedMajors.length > 0 && (
                        <View style={styles.filterBadge}>
                          <Text style={styles.filterBadgeText}>{selectedMajors.length}</Text>
                        </View>
                      )}
                      <DownArrowIcon />
                    </TouchableOpacity>

                    <View style={styles.filterRow}>
                      <Text style={styles.filterLabel}>Institution</Text>
                      <Text style={styles.filterValue}>......</Text>
                      <DownArrowIcon />
                    </View>

                    <View style={[styles.filterRow, { marginBottom: 0 }]}>
                      <Text style={styles.filterLabel}>......</Text>
                      <Text style={styles.filterValue}>......</Text>
                      <DownArrowIcon />
                    </View>
                  </View>

                  {/* Target Viewer Number Section */}
                  <View style={styles.targetViewerSection}>
                    <Text style={styles.sectionTitle}>Target Viewer Number</Text>
                    <View style={styles.targetViewerContent}>
                      <TextInput
                        style={styles.targetNumberInput}
                        value={targetViewers.toString()}
                        onChangeText={(text) => {
                          const num = parseInt(text);
                          if (!isNaN(num) && num > 0) {
                            setTargetViewers(num);
                          } else if (text === '') {
                            setTargetViewers(0);
                          }
                        }}
                        keyboardType="numeric"
                        placeholder="100"
                        returnKeyType="done"
                        onSubmitEditing={() => contentInputRef.current?.blur()}
                      />
                      <Text style={styles.recommendedText}>
                        Recommended: {calculateRecommendedViewers().min}-{calculateRecommendedViewers().max}
                      </Text>
                    </View>
                  </View>

                  {/* Target Reading Time Section */}
                  <View style={styles.readingTimeSection}>
                    <Text style={styles.sectionTitle}>Target Reading Time Length Per Viewer</Text>
                    <View style={styles.readingTimeInputContainer}>
                      <TextInput
                        style={styles.targetNumberInput}
                        value={targetReadingTime.toString()}
                        onChangeText={(text) => {
                          const num = parseInt(text);
                          if (!isNaN(num) && num > 0) {
                            setTargetReadingTime(num);
                          } else if (text === '') {
                            setTargetReadingTime(0);
                          }
                        }}
                        keyboardType="numeric"
                        placeholder="30"
                        returnKeyType="done"
                        onSubmitEditing={() => contentInputRef.current?.blur()}
                      />
                      <Text style={styles.timeUnit}>s</Text>
                    </View>
                    
                    {/* Energy Cost */}
                    <View style={styles.energyCostContainer}>
                      <Text style={styles.energyCostLabel}>Energy Cost:</Text>
                      <View style={styles.energyCostRow}>
                        <View style={styles.energyCostBadge}>
                          <LightningIcon size={20} color="#FFFFFF" />
                        </View>
                        <Text style={styles.energyCostValue}>{calculateEnergyCost()}</Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>

                {/* Bottom Action Buttons - 只保留两个按钮 */}
                <View style={styles.modalActionsTwo}>
                  <TouchableOpacity 
                    style={[styles.modalButtonHalf, styles.cancelModalButton]}
                    onPress={() => setShowTargetFilter(false)}
                  >
                    <Text style={styles.cancelModalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.modalButtonHalf}
                    onPress={() => setShowTargetFilter(false)}
                  >
                    <LinearGradient
                      colors={['#FFD700', '#FF9317']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradientApplyButton}
                    >
                      <Text style={styles.applyModalButtonText}>Apply</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Home Indicator */}
      <View style={styles.homeIndicatorContainer}>
        <View style={styles.homeIndicator} />
      </View>
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    elevation: 5,
  },
  headerTitle: {
    color: '#475569',
    fontSize: 18,
    fontWeight: 'bold',
  },
  energyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 5,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  energyBadgeText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  content: {
    paddingHorizontal: 20,
  },
  inputSection: {
    paddingVertical: 10,
    paddingLeft: 10,
  },
  inputLabel: {
    color: '#ACB1C6',
    fontSize: 14,
    fontWeight: 'bold',
  },
  titleInput: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600', // 添加字体粗细
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  contentInput: {
    fontSize: 15, // 稍微增大字号
    color: '#1F2937', // 改为更深的颜色
    fontWeight: '500', // 添加字体粗细
    paddingLeft: 10,
    paddingTop: 10,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  expandedContentInput: {
    minHeight: 240,
  },
  expandButtonContainer: {
    alignItems: 'flex-end',
    paddingRight: 8,
    marginBottom: 20,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 25,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  expandButtonText: {
    color: '#ACB1C6',
    fontSize: 12,
    marginLeft: 4,
  },
  imageSection: {
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  addImageButton: {
    width: 100,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImagePlus: {
    position: 'relative',
    width: 40,
    height: 40,
  },
  addImagePlusH: {
    position: 'absolute',
    width: 40,
    height: 2,
    backgroundColor: '#CBD5E1',
    top: 19,
  },
  addImagePlusV: {
    position: 'absolute',
    height: 40,
    width: 2,
    backgroundColor: '#CBD5E1',
    left: 19,
  },
  imageGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
    marginBottom: 10,
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    zIndex: 10,
  },
  deleteIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  targetGroupButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  targetGroupLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  targetGroupText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '500',
  },
  arrowRight: {
    color: '#ACB1C6',
    fontSize: 20,
  },
  balanceSection: {
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  balanceLabel: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '500',
  },
  balanceValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceValueYellow: {
    color: '#FBBF24',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  balanceValueGrey: {
    color: '#94A3B8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  publishButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  publishButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 15,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  publishButtonDisabled: {
    opacity: 0.6,
  },
  publishButtonText: {
    color: '#94A3B8',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 20,
  },
  homeIndicatorContainer: {
    alignItems: 'center',
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  homeIndicator: {
    width: 130,
    height: 5,
    backgroundColor: '#333',
    borderRadius: 2.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContentWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    maxWidth: '90%',
    width: 350,
    maxHeight: '80%',
  },
  modalContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  filtersSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filtersTitle: {
    color: '#ACB1C6',
    fontSize: 14,
    marginBottom: 20,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterLabel: {
    color: '#ACB1C6',
    fontSize: 14,
    minWidth: 60,
    marginRight: 10,
  },
  filterValue: {
    color: '#475569',
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  filterBadge: {
    backgroundColor: '#0A66C2',
    borderRadius: 5,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 8,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 25,
    paddingVertical: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  inlineFilterContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  inlineFilterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  inlineFilterBack: {
    color: '#0A66C2',
    fontSize: 16,
    fontWeight: '600',
  },
  inlineFilterTitle: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inlineFilterDone: {
    color: '#0A66C2',
    fontSize: 16,
    fontWeight: '600',
  },
  inlineFilterContent: {
    flex: 1,
  },
  filterItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterItemLast: {
    borderBottomWidth: 0,
  },
  filterItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterItemText: {
    flex: 1,
  },
  filterItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  filterItemDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterCheckbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  filterCheckboxChecked: {
    backgroundColor: '#0A66C2',
    borderColor: '#0A66C2',
  },
  filterCheckboxText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  targetViewerSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 20,
  },
  sectionTitle: {
    color: '#ACB1C6',
    fontSize: 14,
    marginBottom: 15,
  },
  targetViewerContent: {
    alignItems: 'center',
  },
  targetNumberInput: {
    color: '#0A66C2',
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 150,
    paddingVertical: 10,
  },
  recommendedText: {
    color: '#ACB1C6',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  readingTimeSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  readingTimeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  timeUnit: {
    color: '#0A66C2',
    fontSize: 48,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  energyCostContainer: {
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  energyCostLabel: {
    color: '#475569',
    fontSize: 14,
    marginBottom: 8,
  },
  energyCostRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  energyCostBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  energyCostValue: {
    color: '#FF9317',
    fontSize: 32,
    fontWeight: 'bold',
  },
  modalActionsTwo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 10,
  },
  modalButtonHalf: {
    flex: 1,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 7, // 只给 Cancel 按钮减少内边距
  },
  cancelModalButtonText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '600',
  },
  gradientApplyButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    width: '100%',
  },
  applyModalButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});