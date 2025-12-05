import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
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

// 导入API函数 - 修复：只从一个地方导入，避免重复
import { sendPost, uploadImage, type PostData } from '@/services/api';
import { extractHashtags, stripHashtags } from '@/utils/tags';

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

const ImageIcon = () => (
  <Image
    source={{uri: "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/fb63fc82-2561-4765-8c59-cf7dc3fdeebd"}}
    resizeMode="stretch"
    style={{
      width: 24,
      height: 24,
      marginRight: 3,
    }}
  />
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

// 添加CollapseIcon组件
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
    newPost: 'New Post',
    send: 'Send',
    cancel: 'Cancel',
    title: 'Title (Optional)', // 修改：添加可选提示
    content: 'Content...',
    tags: 'Tags',
    user: 'User',
    expand: 'Expand',
    collapse: 'Collapse',
    switchToTargeted: 'Switch to a Targeted Message',
    publishSuccess: 'Post published successfully!',
    publishFailed: 'Failed to publish post',
    titleRequired: 'Title is required', // 保留但不再使用
    contentRequired: 'Content is required',
    publishing: 'Publishing...',
    uploadingImages: 'Uploading images...',
    addImage: 'Add Image',
    filters: 'Filters',
    school: 'School',
    schoolList: 'CUHK, HKU, HKUST, ...',
    type: 'Type',
    undergraduate: 'Undergraduate',
    major: 'Major',
    institution: 'Institution',
    targetViewerNumber: 'Target Viewer Number',
    recommended: 'Recommended: 85-141',
    targetReadingTime: 'Target Reading Time Length Per Viewer',
    energyCost: 'Energy Cost:',
    delete: 'Delete',
    apply: 'Apply',
    selectSchool: 'Select School',
    selectType: 'Select Type',
    confirm: 'Confirm',
    selectTags: 'Select Tags',
    maxTags: 'Maximum 5 tags',
    searchOrCreateTag: 'Search or create tag',
    atFriends: '@Friends',
    searchNameOrUsername: 'Search name/username',
    selected: 'Selected',
    close: 'Close',
  },
  CN: {
    newPost: '新建帖子',
    send: '发送',
    cancel: '取消',
    title: '标题（选填）', // 修改：添加可选提示
    content: '内容...',
    tags: '标签',
    user: '用户',
    expand: '展开',
    collapse: '收起',
    switchToTargeted: '切换到定向消息',
    publishSuccess: '帖子发布成功！',
    publishFailed: '发布失败',
    titleRequired: '请输入标题', // 保留但不再使用
    contentRequired: '请输入内容',
    publishing: '发布中...',
    uploadingImages: '图片上传中...',
    addImage: '添加图片',
    filters: '过滤器',
    school: '学校',
    schoolList: '中大、港大、科大等...',
    type: '类型',
    undergraduate: '本科生',
    major: '专业',
    institution: '机构',
    targetViewerNumber: '目标观看人数',
    recommended: '推荐: 85-141',
    targetReadingTime: '每位观看者目标阅读时长',
    energyCost: '能量消耗:',
    delete: '删除',
    apply: '应用',
    selectSchool: '选择学校',
    selectType: '选择类型',
    confirm: '确认',
    selectTags: '选择标签',
    maxTags: '最多5个标签',
    searchOrCreateTag: '搜索或创建标签',
    atFriends: '@好友',
    searchNameOrUsername: '搜索昵称/用户名',
    selected: '已选',
    close: '关闭',
  }
};

const { width: screenWidth } = Dimensions.get('window');
const imageSize = (screenWidth - 80) / 3;

// 热门标签
const HOT_TAGS = [
  '考研', 'OOTD', '旅游', '美食', '开箱', '健身', '护肤', '数码', '读书', 'vlog', '职场', '母婴',
  '学习', '生活', '分享', '推荐', '校园', '实习', '求职', '课程', '导师', '论文', '毕业',
  'Study', 'Life', 'Campus', 'Food', 'Travel', 'Books', 'Tech', 'Fashion', 'Fitness'
];

// 示例联系人数据
const SAMPLE_USERS = [
  { id: '1', name: 'Alice Wang', username: 'alice_w', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', name: 'Bob Chen', username: 'bob_chen', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: '3', name: 'Cathy Liu', username: 'cathy_l', avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: '4', name: 'David Zhang', username: 'david_z', avatar: 'https://i.pravatar.cc/150?img=4' },
  { id: '5', name: 'Emma Li', username: 'emma_li', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: '6', name: '小明', username: 'xiaoming', avatar: 'https://i.pravatar.cc/150?img=6' },
  { id: '7', name: 'Lily', username: 'lily', avatar: 'https://i.pravatar.cc/150?img=7' },
  { id: '8', name: '王同学', username: 'wang_student', avatar: 'https://i.pravatar.cc/150?img=8' },
];

// 学校和类型选择选项
const schoolOptions = [
  { id: 'cuhk', name: 'CUHK', fullName: 'Chinese University of Hong Kong' },        // CUHK 移到第一位
  { id: 'hku', name: 'HKU', fullName: 'University of Hong Kong' },        // HKU 移到第二位
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

// 标签选择器组件
const TagSelector = ({ visible, onClose, onSelectTag, selectedTags, language }: {
  visible: boolean;
  onClose: () => void;
  onSelectTag: (tag: string) => void;
  selectedTags: string[];
  language: 'EN' | 'CN';
}) => {
  const [search, setSearch] = useState('');
  
  const t = text[language];
  const MAX_TAGS = 5;

  const handleTagPress = (tag: string) => {
    onSelectTag(tag); // 直接调用父组件的处理函数
  };

  const handleDelete = (tag: string) => {
    onSelectTag(tag); // 删除也是调用同一个函数
  };

  // 支持搜索或自定义标签
  const displayTags = search.trim()
    ? HOT_TAGS.filter(t => t.toLowerCase().includes(search.toLowerCase())).concat(
        HOT_TAGS.some(hotTag => hotTag.toLowerCase() === search.toLowerCase()) ? [] : [search.trim()]
      )
    : HOT_TAGS;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.tagModalBg}>
        <View style={styles.tagModalContainer}>
          <View style={styles.tagModalHeader}>
            <Text style={styles.tagModalTitle}>
              {t.selectTags}（最多{MAX_TAGS}个）
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.tagModalClose}>×</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.tagModalContent}>
            <TextInput
              style={styles.tagSearchInput}
              value={search}
              onChangeText={setSearch}
              placeholder={t.searchOrCreateTag}
              placeholderTextColor="#ACB1C6"
            />

            {/* 已选标签 */}
            {selectedTags.length > 0 && (
              <View style={styles.selectedTagsContainer}>
                <Text style={styles.selectedTagsTitle}>已选标签：</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.selectedTagsRow}>
                    {selectedTags.map(tag => (
                      <View key={tag} style={styles.selectedTag}>
                        <Text style={styles.selectedTagText}>#{tag}</Text>
                        <TouchableOpacity onPress={() => handleDelete(tag)}>
                          <Text style={styles.deleteTagBtn}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* 推荐标签 */}
            <Text style={styles.tagSectionTitle}>
              {search.trim() ? '搜索结果' : '热门标签'}
            </Text>
            <ScrollView style={styles.tagScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.tagGrid}>
                {displayTags.map(tag => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagItem,
                      selectedTags.includes(tag) && styles.tagItemSelected,
                      selectedTags.length >= MAX_TAGS && !selectedTags.includes(tag) && styles.tagItemDisabled
                    ]}
                    onPress={() => handleTagPress(tag)}
                    disabled={selectedTags.length >= MAX_TAGS && !selectedTags.includes(tag)}
                  >
                    <Text style={[
                      styles.tagItemText,
                      selectedTags.includes(tag) && styles.tagItemTextSelected
                    ]}>
                      #{tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// @用户选择器组件
const AtUserSelector = ({ visible, onClose, onSelectUser, selectedUsers, language }: {
  visible: boolean;
  onClose: () => void;
  onSelectUser: (user: any) => void;
  selectedUsers: string[];
  language: 'EN' | 'CN';
}) => {
  const [search, setSearch] = useState('');
  
  const t = text[language];

  // 筛选用户
  const filteredUsers = search
    ? SAMPLE_USERS.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.username.toLowerCase().includes(search.toLowerCase())
      )
    : SAMPLE_USERS;

  const handleUserSelect = (user: any) => {
    onSelectUser(user);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.atModalBg}>
        <View style={styles.atModalContainer}>
          <View style={styles.atModalHeader}>
            <Text style={styles.atModalTitle}>{t.atFriends}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.atModalClose}>×</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.atSearchInput}
            placeholder={t.searchNameOrUsername}
            placeholderTextColor="#ACB1C6"
            value={search}
            onChangeText={setSearch}
          />
          
          <FlatList
            data={filteredUsers}
            keyExtractor={u => u.id}
            style={styles.atUserList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.atUserRow}
                onPress={() => handleUserSelect(item)}
              >
                <Image source={{ uri: item.avatar }} style={styles.atUserAvatar} />
                <View style={styles.atUserInfo}>
                  <Text style={styles.atUserName}>{item.name}</Text>
                  <Text style={styles.atUserUsername}>@{item.username}</Text>
                </View>
                {selectedUsers.includes(item.username) && (
                  <Text style={styles.atUserSelected}>{t.selected}</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

// 主组件
export default function PostScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState<'EN' | 'CN'>('EN');
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTargetedFilter, setShowTargetedFilter] = useState(false);
  const [isTargetedMode, setIsTargetedMode] = useState(false);
  
  // 图片相关状态
  const [images, setImages] = useState<string[]>([]);
  const [isEditingImages, setIsEditingImages] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);

  // 新增选择器状态
  const [showSchoolSelector, setShowSchoolSelector] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [selectedSchools, setSelectedSchools] = useState<string[]>(['cuhk', 'hku', 'hkust']);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['undergraduate']);

  // 新增数值输入状态
  const [targetViewers, setTargetViewers] = useState<number>(100);
  const [targetReadingTime, setTargetReadingTime] = useState<number>(30);

  // 新增标签和@用户选择器状态
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [showAtUserSelector, setShowAtUserSelector] = useState(false);
  const [selectedAtUsers, setSelectedAtUsers] = useState<string[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  
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

  // 计算能量消耗
  const calculateEnergyCost = () => {
    const energy = (targetViewers * targetReadingTime) / 60;
    return Math.round(energy * 100) / 100;
  };

  // 处理标签选择
  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      // 如果已选中，则取消选择
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 5) {
      // 如果未选中且未达到上限，则添加
      setSelectedTags([...selectedTags, tag]);
    } else {
      // 达到上限时提示用户
      Alert.alert('提示', '最多只能选择5个标签');
    }
  };

  // 修改：处理标签按钮点击 - 只打开选择器，不修改内容
  const handleTagButtonPress = () => {
    setShowTagSelector(true);
  };

  // 修改：处理@用户点击 - 在内容中插入@符号并打开选择器
  const handleAtUserButtonPress = () => {
    const newContent = content.slice(0, cursorPosition) + '@' + content.slice(cursorPosition);
    setContent(newContent);
    setCursorPosition(cursorPosition + 1);
    setShowAtUserSelector(true);
  };

  // 处理@用户选择
  const handleAtUserSelect = (user: any) => {
    const atText = `@${user.username} `;
    const beforeCursor = content.slice(0, cursorPosition);
    const afterCursor = content.slice(cursorPosition);
    
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const newContent = beforeCursor.slice(0, lastAtIndex) + atText + afterCursor;
      setContent(newContent);
      setCursorPosition(lastAtIndex + atText.length);
    }
    
    if (!selectedAtUsers.includes(user.username)) {
      setSelectedAtUsers([...selectedAtUsers, user.username]);
    }
    
    setShowAtUserSelector(false);
  };

  // 新增：专门处理内容输入框的文本变化
  const handleContentChange = (text: string) => {
    setContent(text);
    
    // 自动检测并提取hashtag到标签列表（但不修改显示的内容）
    const detectedTags = extractHashtags(text);
    
    // 将检测到的标签添加到选中的标签中（去重并限制数量）
    if (detectedTags.length > 0) {
      setSelectedTags(prev => {
        const newTags = [...prev];
        detectedTags.forEach(tag => {
          if (!newTags.includes(tag) && newTags.length < 5) { // 限制最多5个
            newTags.push(tag);
          }
        });
        return newTags;
      });
    }
  };

  // 修改：专门处理标题输入框的文本变化
  const handleTitleChange = (text: string) => {
    setTitle(text);
    
    // 也从标题中自动检测hashtag
    const detectedTags = extractHashtags(text);
    
    // 将检测到的标签添加到选中的标签中（去重并限制数量）
    if (detectedTags.length > 0) {
      setSelectedTags(prev => {
        const newTags = [...prev];
        detectedTags.forEach(tag => {
          if (!newTags.includes(tag) && newTags.length < 5) { // 限制最多5个
            newTags.push(tag);
          }
        });
        return newTags;
      });
    }
  };

  // 处理内容输入框选择变化
  const handleContentSelectionChange = (event: any) => {
    setCursorPosition(event.nativeEvent.selection.start);
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

  // 处理数值输入
  const handleViewersChange = (text: string) => {
    const num = parseInt(text);
    if (!isNaN(num) && num > 0) {
      setTargetViewers(num);
    }
  };

  const handleReadingTimeChange = (text: string) => {
    const num = parseInt(text);
    if (!isNaN(num) && num > 0) {
      setTargetReadingTime(num);
    }
  };

const handlePublish = async () => {
  // 移除title必填验证，只保留content必填验证
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
    
    // 图片上传逻辑保持不变
    if (images.length > 0) {
      console.log('Starting image upload, total images:', images.length);
      
      try {
        for (let i = 0; i < images.length; i++) {
          const imageUri = images[i];
          console.log(`Uploading image ${i + 1}/${images.length}:`, imageUri);
          
          const uploadResult = await uploadImage(imageUri, token);
          console.log(`Upload result for image ${i + 1}:`, uploadResult);
          
          if (uploadResult.success && uploadResult.data?.key) {
            imageUrl = uploadResult.data.key;
            console.log('✅ Successfully uploaded image with key:', imageUrl);
            break;
          } else {
            console.warn(`❌ Failed to upload image ${i + 1}:`, uploadResult.message);
          }
        }
        
        if (!imageUrl) {
          console.error('❌ All image uploads failed');
          if (Platform.OS === 'web') {
            const proceed = window.confirm('图片上传失败，是否继续发布文字内容？');
            if (!proceed) {
              return;
            }
          } else {
            Alert.alert(
              '图片上传失败', 
              '是否继续发布文字内容？',
              [
                { text: '取消', style: 'cancel', onPress: () => {} },
                { 
                  text: '继续', 
                  onPress: () => {
                    // 继续发布逻辑将在下面执行
                  }
                }
              ]
            );
          }
        } else {
          console.log('✅ Final image URL for post:', imageUrl);
        }
      } catch (error) {
        console.error('❌ Error during image upload:', error);
        if (Platform.OS === 'web') {
          const proceed = window.confirm('图片上传遇到网络错误，是否继续发布文字内容？');
          if (!proceed) {
            return;
          }
        } else {
          Alert.alert('上传错误', '图片上传遇到网络错误，是否继续发布文字内容？');
        }
      }
    }

    const tagsFromTitle = extractHashtags(title);
    const tagsFromContent = extractHashtags(content);
    const pickedTags = selectedTags || [];

    const allTags = Array.from(new Set([
      ...pickedTags,
      ...tagsFromTitle,
      ...tagsFromContent,
    ])).slice(0, 5);

    // 修改：自动生成title的逻辑
    let finalTitle: string;
    if (title.trim()) {
      // 如果有输入title，使用输入的title
      finalTitle = title.trim();
    } else {
      // 如果没有输入title，使用content的前六个字符
      const cleanContent = stripHashtags(content);
      finalTitle = cleanContent.trim().substring(0, 6) || 'Untitled';
    }

    const cleanContent = stripHashtags(content);

    console.log('📝 Post data summary:');
    console.log('- Original title input:', title);
    console.log('- Final title:', finalTitle);
    console.log('- Content length:', cleanContent.length);
    console.log('- Image URL:', imageUrl || 'No image');
    console.log('- Tags:', allTags);
    console.log('- Is targeted:', isTargetedMode);

    const postData: PostData = {
      title: finalTitle,
      content: cleanContent,
      image_url: imageUrl || "",
      ref: isTargetedMode ? "targeted" : "",
      real_name: !isTargetedMode,
      tags: allTags.join(','),
      type: isTargetedMode ? "targeted" : "normal",
    };

    console.log('🚀 Sending post data:', JSON.stringify(postData, null, 2));

    const result = await sendPost(postData, token);

    if (result.success) {
      // 清空表单
      setTitle('');
      setContent('');
      setSelectedTags([]);
      setSelectedAtUsers([]);
      setImages([]);
      setUploadedImageUrls([]);
      setIsTargetedMode(false);

      console.log('✅ Post published successfully!');      if (Platform.OS === 'web') {
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
                console.error('Router replace failed:', error);
                router.push('/');
              }
            }
          }
        ]);
      }
    } else {
      console.error('❌ Post publish failed:', result.message);
      if (Platform.OS === 'web') {
        window.alert(result.message || t.publishFailed);
      } else {
        Alert.alert('Error', result.message || t.publishFailed);
      }
    }
  } catch (error) {
    console.error('❌ Error publishing post:', error);
    if (Platform.OS === 'web') {
      window.alert('Network error. Please try again.');
    } else {
      Alert.alert('Error', 'Network error. Please try again.');
    }
  } finally {
    setIsPublishing(false);
  }
};

  // 取消发布
  const handleCancel = () => {
    if (title.trim() || content.trim() || images.length > 0) {
      Alert.alert(
        'Confirm',
        language === 'EN' ? 'Are you sure you want to discard this post?' : '确定要放弃这篇帖子吗？',
        [
          { text: language === 'EN' ? 'Cancel' : '取消', style: 'cancel' },
          { 
            text: language === 'EN' ? 'Discard' : '放弃', 
            style: 'destructive',
            onPress: () => {
              setTitle('');
              setContent('');
              setSelectedTags([]);
              setSelectedAtUsers([]);
              setImages([]);
              setUploadedImageUrls([]);
              setIsTargetedMode(false);

              // 新增：返回到 index 界面
              router.back();
            }
          }
        ]
      );
    } else {
      // 新增：如果没有输入内容，直接返回
      router.back();
    };
  }

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

  // 渲染图片网格
  const renderImageGrid = () => {
    const rows = [];
    const imageCount = images.length;
    const showAddButton = imageCount < 9;
    const totalItems = showAddButton ? imageCount + 1 : imageCount;
    
    for (let i = 0; i < Math.ceil(totalItems / 3); i++) {
      const rowItems = [];
      for (let j = 0; j < 3; j++) {
        const index = i * 3 + j;
        if (index < imageCount) {
          // 渲染图片
          rowItems.push(
            <TouchableOpacity
              key={index}
              style={styles.imageContainer}
              onLongPress={onLongPress}
              delayLongPress={2000}
            >
              <Image
                source={{ uri: images[index] }}
                style={styles.uploadedImage}
                resizeMode="cover"
              />
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
          );
        } else if (index === imageCount && showAddButton) {
          // 渲染添加按钮
          rowItems.push(
            <TouchableOpacity
              key="add"
              style={styles.addImageButton}
              onPress={pickImage}
            >
              <AddImageIcon />
            </TouchableOpacity>
          );
        } else {
          // 空白占位
          rowItems.push(<View key={`empty-${index}`} style={styles.emptySlot} />);
        }
      }
      rows.push(
        <View key={i} style={styles.imageRow}>
          {rowItems}
        </View>
      );
    }

    return rows;
  };

  // 处理应用过滤器
  const handleApplyFilter = () => {
    setIsTargetedMode(true);
    setShowTargetedFilter(false);
  };

  // 点击其他区域退出编辑模式
  const exitEditMode = () => {
    if (isEditingImages) {
      setIsEditingImages(false);
    }
  };

  // 渲染学校选择器
  const renderSchoolSelector = () => (
    <Modal
      visible={showSchoolSelector}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.filterScreenContainer}>
        <View style={styles.filterHeader}>
          <TouchableOpacity onPress={() => setShowSchoolSelector(false)}>
            <Text style={styles.filterHeaderButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.filterHeaderTitle}>{t.selectSchool}</Text>
          <TouchableOpacity onPress={() => setShowSchoolSelector(false)}>
            <Text style={styles.filterHeaderButton}>Done</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.filterContent}>
          {schoolOptions.map((school) => (
            <TouchableOpacity
              key={school.id}
              style={styles.filterItem}
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
      </SafeAreaView>
    </Modal>
  );

  // 渲染类型选择器
  const renderTypeSelector = () => (
    <Modal
      visible={showTypeSelector}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.filterScreenContainer}>
        <View style={styles.filterHeader}>
          <TouchableOpacity onPress={() => setShowTypeSelector(false)}>
            <Text style={styles.filterHeaderButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.filterHeaderTitle}>{t.selectType}</Text>
          <TouchableOpacity onPress={() => setShowTypeSelector(false)}>
            <Text style={styles.filterHeaderButton}>Done</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.filterContent}>
          {typeOptions.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={styles.filterItem}
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
      </SafeAreaView>
    </Modal>
  );

  // 添加缺失的 handleExpandToggle 函数
  const handleExpandToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <View style={styles.headerLeft}>
          {!isTargetedMode && (
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={handleCancel}
              disabled={isPublishing}
            >
              <Text style={styles.cancelButtonText}>{t.cancel}</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.headerTitle}>{t.newPost}</Text>
        
        <View style={styles.headerRight}>
          {isTargetedMode ? (
            <TouchableOpacity 
              onPress={handlePublish}
              disabled={isPublishing}
              style={[isPublishing && styles.buttonDisabled]}
            >
              <LinearGradient
                colors={['#FFD700', '#FF9317']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientSendButton}
              >
                <LightningIcon size={16} color="#FFFFFF" />  {/* 明确指定白色 */}
                <Text style={styles.gradientSendText}>
                  {isPublishing ? t.publishing : t.send}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.button, styles.sendButton, isPublishing && styles.buttonDisabled]} 
              onPress={handlePublish}
              disabled={isPublishing}
            >
              <Text style={styles.sendButtonText}>
                {isPublishing ? t.publishing : t.send}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Scrollable Content */}
      <KeyboardAvoidingView 
        style={styles.contentContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity 
          style={styles.scrollView} 
          activeOpacity={1} 
          onPress={exitEditMode}
        >
          <ScrollView 
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Input Fields */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.titleInput, isTargetedMode && styles.targetedInput]}
                placeholder={t.title}
                placeholderTextColor="#ACB1C6"
                value={title}
                onChangeText={handleTitleChange} // 使用专门的标题处理函数
                maxLength={100}
                editable={!isPublishing}
              />
              
              <View style={styles.divider} />
              
              <TextInput
                ref={contentInputRef}
                style={[
                  styles.contentInput, 
                  isTargetedMode && styles.targetedInput,
                  isExpanded && styles.expandedContentInput
                ]}
                placeholder={t.content}
                placeholderTextColor="#ACB1C6"
                value={content}
                onChangeText={handleContentChange} // 使用专门的内容处理函数
                onSelectionChange={handleContentSelectionChange}
                multiline
                numberOfLines={isExpanded ? 15 : 8}
                textAlignVertical="top"
                maxLength={1000}
                editable={!isPublishing}
              />

              {/* Action Buttons */}
              <View style={styles.actionButtonsContainer}>
                <View style={styles.leftButtons}>
                  <TouchableOpacity 
                    style={[styles.actionButton, selectedTags.length > 0 && styles.actionButtonActive]}
                    onPress={handleTagButtonPress}
                    disabled={isPublishing}
                  >
                    <TagIcon />
                    <Text style={[styles.actionButtonText, selectedTags.length > 0 && styles.actionButtonTextActive]}>
                      {t.tags}
                      {selectedTags.length > 0 && ` (${selectedTags.length})`}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, selectedAtUsers.length > 0 && styles.actionButtonActive]}
                    onPress={handleAtUserButtonPress}
                    disabled={isPublishing}
                  >
                    <UserIcon />
                    <Text style={[styles.actionButtonText, selectedAtUsers.length > 0 && styles.actionButtonTextActive]}>
                      {t.user}
                      {selectedAtUsers.length > 0 && ` (${selectedAtUsers.length})`}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={handleExpandToggle}
                  disabled={isPublishing}
                >
                  {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                  <Text style={styles.actionButtonText}>
                    {isExpanded ? t.collapse : t.expand}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 显示已选择的标签 */}
            {selectedTags.length > 0 && (
              <View style={styles.selectedTagsPreview}>
                <Text style={styles.selectedTagsTitle}>已选标签：</Text>
                <View style={styles.selectedTagsContainer}>
                  {selectedTags.map(tag => (
                    <TouchableOpacity
                      key={tag}
                      style={styles.selectedTagChip}
                      onPress={() => handleTagSelect(tag)} // 点击可以取消选择
                    >
                      <Text style={styles.selectedTagChipText}>#{tag}</Text>
                      <Text style={styles.selectedTagRemove}>×</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Image Grid */}
            {!isPublishing && (
              <View style={styles.imageGridContainer}>
                {renderImageGrid()}
              </View>
            )}

            {/* Targeted Message Option */}
            <TouchableOpacity 
              style={styles.targetedMessageContainer}
              onPress={() => setShowTargetedFilter(true)}
              disabled={isPublishing}
            >
              <View style={styles.targetedMessageContent}>
                <ImageIcon />
                <Text style={styles.targetedMessageText}>
                  {t.switchToTargeted}
                </Text>
              </View>
              {isTargetedMode ? (
                <View style={styles.targetedBadge}>
                  <LightningIcon size={12} color="#FFFFFF" />
                  <Text style={styles.targetedBadgeText}>{calculateEnergyCost()}</Text>
                </View>
              ) : (
                <ArrowRightIcon />
              )}
            </TouchableOpacity>

            {/* 底部间距，考虑tab高度 */}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {/* Targeted Filter Modal */}
      <Modal
        visible={showTargetedFilter}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTargetedFilter(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContentWrapper, { minHeight: 400, maxHeight: '80%' }]}>
            {/* School Selection Modal */}
            {showSchoolSelector ? (
              <View style={styles.inlineFilterContainer}>
                <View style={styles.inlineFilterHeader}>
                  <TouchableOpacity onPress={() => setShowSchoolSelector(false)}>
                    <Text style={styles.inlineFilterBack}>← Back</Text>
                  </TouchableOpacity>
                  <Text style={styles.inlineFilterTitle}>{t.selectSchool}</Text>
                  <TouchableOpacity onPress={() => setShowSchoolSelector(false)}>
                    <Text style={styles.inlineFilterDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView 
                  style={styles.inlineFilterContent} 
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ flexGrow: 1, paddingBottom: 0 }} // 移除底部内边距
                >
                  {schoolOptions.map((school, index) => (
                    <TouchableOpacity
                      key={school.id}
                      style={[
                        styles.filterItem,
                        index === schoolOptions.length - 1 && styles.filterItemLast // 最后一项使用特殊样式
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
                  <Text style={styles.inlineFilterTitle}>{t.selectType}</Text>
                  <TouchableOpacity onPress={() => setShowTypeSelector(false)}>
                    <Text style={styles.inlineFilterDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.inlineFilterContent} showsVerticalScrollIndicator={false}>
                  {typeOptions.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={styles.filterItem}
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
            ) : (
              <View style={styles.modalContent}>
                {/* 主过滤器内容保持不变 */}
                <View style={styles.filtersSection}>
                  <Text style={styles.filtersTitle}>{t.filters}</Text>
                  
                  {/* School Filter */}
                  <TouchableOpacity 
                    style={styles.filterRow}
                    onPress={() => setShowSchoolSelector(true)}
                  >
                    <Text style={styles.filterLabel}>{t.school}</Text>
                    <Text style={styles.filterValue} numberOfLines={1}>
                      {getSelectedSchoolsText()}
                    </Text>
                    <View style={styles.filterBadge}>
                      <Text style={styles.filterBadgeText}>{selectedSchools.length}</Text>
                    </View>
                    <DownArrowIcon />
                  </TouchableOpacity>

                  {/* Type Filter */}
                  <TouchableOpacity 
                    style={styles.filterRow}
                    onPress={() => setShowTypeSelector(true)}
                  >
                    <Text style={styles.filterLabel}>{t.type}</Text>
                    <Text style={styles.filterValue} numberOfLines={1}>
                      {getSelectedTypesText()}
                    </Text>
                    <View style={styles.filterBadge}>
                      <Text style={styles.filterBadgeText}>{selectedTypes.length}</Text>
                    </View>
                    <DownArrowIcon />
                  </TouchableOpacity>

                  {/* 其他过滤器选项... */}
                  <View style={styles.filterRow}>
                    <Text style={[styles.filterLabel, {flex: 1}]}>{t.major}</Text>
                    <Image
                      source={{uri: "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/328788e6-61f5-4768-8170-7d6837e1868f"}}
                      resizeMode="stretch"
                      style={styles.filterArrowIcon}
                    />
                  </View>

                  <View style={styles.filterRow}>
                    <Text style={[styles.filterLabel, {flex: 1}]}>{t.institution}</Text>
                    <Image
                      source={{uri: "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/4c08ce9c-88b1-4262-838e-52a1c1fa445c"}}
                      resizeMode="stretch"
                      style={styles.filterArrowIcon}
                    />
                  </View>

                  <View style={[styles.filterRow, {marginBottom: 0}]}>
                    <Text style={[styles.filterLabel, {marginRight: 74}]}>......</Text>
                    <Text style={[styles.filterValue, {flex: 1}]}>......</Text>
                    <Image
                      source={{uri: "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/93969eb3-5674-4700-b7a1-6c1c2e912367"}}
                      resizeMode="stretch"
                      style={styles.filterArrowIcon}
                    />
                  </View>
                </View>

                {/* Target Viewer Number Section */}
                <View style={styles.targetViewerSection}>
                  <Text style={styles.sectionTitle}>{t.targetViewerNumber}</Text>
                  <View style={styles.targetViewerContent}>
                    <TextInput
                      style={styles.targetNumberInput}
                      value={targetViewers.toString()}
                      onChangeText={handleViewersChange}
                      keyboardType="numeric"
                      textAlign="center"
                    />
                    <View style={styles.recommendedContainer}>
                      <Text style={styles.recommendedText}>{t.recommended}</Text>
                    </View>
                  </View>
                </View>

                {/* Target Reading Time Section */}
                <View style={styles.readingTimeSection}>
                  <Text style={styles.sectionTitle}>{t.targetReadingTime}</Text>
                  <View style={styles.readingTimeContainer}>
                    <TextInput
                      style={styles.targetNumberInput}
                      value={targetReadingTime.toString()}
                      onChangeText={handleReadingTimeChange}
                      keyboardType="numeric"
                      textAlign="center"
                    />
                    <Text style={styles.timeUnit}>s</Text>
                  </View>
                  
                  {/* Energy Cost */}
                  <View style={styles.energyCostContainer}>
                    <Text style={styles.energyCostLabel}>{t.energyCost}</Text>
                    <View style={styles.energyCostRow}>
                      <View style={styles.energyBadge}>
                        <LightningIcon size={20} color="#FFFFFF" />
                      </View>
                      <Text style={styles.energyCostValue}>{calculateEnergyCost()}</Text>
                    </View>
                  </View>
                </View>

                {/* Bottom Action Buttons */}
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelModalButton]}
                    onPress={() => setShowTargetedFilter(false)}
                  >
                    <Text style={styles.cancelModalButtonText}>{t.cancel}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.deleteModalButton]}
                    onPress={() => {
                      setIsTargetedMode(false);
                      setShowTargetedFilter(false);
                    }}
                  >
                    <Text style={styles.deleteModalButtonText}>{t.delete}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.applyModalButton]}
                    onPress={handleApplyFilter}
                  >
                    <LinearGradient
                      colors={['#FFD700', '#FF9317']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradientApplyButton}
                    >
                      <Text style={styles.applyModalButtonText}>{t.apply}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* 删除独立的学校和类型选择器 */}
      {/* {renderSchoolSelector()} */}
      {/* {renderTypeSelector()} */}
    </View>
  );
}


// ...existing code...

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  fixedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderColor: '#ACB1C633',
    borderBottomWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    zIndex: 1000,
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  headerLeft: {
    minWidth: 70,
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: '#475569',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  headerRight: {
    minWidth: 70,
    alignItems: 'flex-end',
  },
  button: {
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    minWidth: 65,
  },
  sendButton: {
    backgroundColor: '#0A66C2',
    minWidth: 55,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    paddingVertical: 15,
    paddingHorizontal: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 10,
  },
  contentInput: {
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 15,
    paddingHorizontal: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    minHeight: 120,
    marginBottom: 20,
  },
  expandedContentInput: {
    minHeight: 240,
  },
  targetedInput: {
    backgroundColor: '#FFF8F0',
    borderColor: '#FF9317',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
  },
  leftButtons: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ACB1C633',
    borderRadius: 25,
    padding: 8,
    marginRight: 8,
  },
  actionButtonActive: {
    backgroundColor: '#FF9317',
  },
  actionButtonText: {
    color: '#ACB1C6',
    fontSize: 12,
    marginLeft: 4,
  },
  actionButtonTextActive: {
    color: '#FFFFFF',
  },
  imageGridContainer: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  imageContainer: {
    position: 'relative',
  },
  uploadedImage: {
    width: imageSize,
    height: imageSize,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  addImageButton: {
    width: imageSize,
    height: imageSize,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ACB1C633',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  emptySlot: {
    width: imageSize,
    height: imageSize,
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
  gradientSendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 55,
    justifyContent: 'center',
    minHeight: 36,
  },
  gradientSendIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  gradientSendText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  targetedBadge: {
    backgroundColor: '#FF9317',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 32,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  targetedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  targetedMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#ACB1C633",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    padding: 10,
    marginBottom: 15,
    marginHorizontal: 20,
  },
  targetedMessageContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  targetedMessageText: {
    color: "#475569",
    fontSize: 14,
    marginVertical: 5,
    flex: 1,
    marginLeft: 3,
  },
  bottomSpacer: {
    height: 100,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContentWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: 'hidden',
    maxWidth: '90%',
    width: 350,
  },
  modalContent: {
    paddingTop: 20,
    paddingBottom: 20,
    marginHorizontal: 20,
  },
  filtersSection: {
    backgroundColor: "#FFFFFF",
    borderColor: "#ACB1C633",
    borderBottomWidth: 1,
    paddingBottom: 15,
    marginBottom: 15,
    marginHorizontal: 15,
  },
  filtersTitle: {
    color: "#ACB1C6",
    fontSize: 14,
    marginBottom: 20,
    marginLeft: 10,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginHorizontal: 10,
  },
  filterLabel: {
    color: "#ACB1C6",
    fontSize: 14,
    minWidth: 60,
    marginRight: 10,
  },
  filterValue: {
    color: "#475569",
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  filterBadge: {
    backgroundColor: "#0A66C2",
    borderRadius: 5,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 8,
  },
  filterBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterArrowIcon: {
    width: 15,
    height: 15,
  },
  targetViewerSection: {
    backgroundColor: "#FFFFFF",
    borderColor: "#ACB1C633",
    borderBottomWidth: 1,
    paddingBottom: 15,
    marginBottom: 15,
    marginHorizontal: 15,
  },
  sectionTitle: {
    color: "#ACB1C6",
    fontSize: 14,
    marginBottom: 15,
    marginLeft: 10,
  },
  targetViewerContent: {
    marginHorizontal: 10,
  },
  targetNumberInput: {
    color: "#0A66C2",
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  recommendedContainer: {
    alignItems: "flex-end",
  },
  recommendedText: {
    color: "#ACB1C6",
    fontSize: 12,
    textAlign: "right",
    marginRight: 3,
  },
  readingTimeSection: {
    marginHorizontal: 15,
  },
  readingTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  timeUnit: {
    color: "#0A66C2",
    fontSize: 34,
    fontWeight: "bold",
    marginLeft: 5,
  },
  energyCostContainer: {
    alignItems: "flex-end",
    marginTop: 15,
  },
  energyCostLabel: {
    color: "#475569",
    fontSize: 14,
    marginBottom: 8,
    marginRight: 28,
  },
  energyCostRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 28,
  },
  energyBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  energyCostValue: {
    color: '#FF9317',
    fontSize: 24,
    fontWeight: "bold",
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 5,
  },
  modalButton: {
    flex: 1,
    borderRadius: 25,
    paddingVertical: 12,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  cancelModalButton: {
    backgroundColor: '#F3F4F6',
  },
  deleteModalButton: {
    backgroundColor: '#FF4D4D',
  },
  applyModalButton: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  gradientApplyButton: {
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    width: '100%',
  },
  cancelModalButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteModalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  applyModalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  filterScreenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  filterHeaderButton: {
    color: '#0A66C2',
    fontSize: 16,
    fontWeight: '600',
  },
  filterHeaderTitle: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 0,
  },
  filterItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterItemLast: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0,
    paddingBottom: 20,
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
  tagModalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  tagModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  tagModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  tagModalTitle: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tagModalClose: {
    color: '#666',
    fontSize: 28,
    fontWeight: '300',
  },
  tagModalContent: {
    padding: 20,
    flex: 1,
  },
  tagSearchInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF2442',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 8,
  },
  selectedTagText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteTagBtn: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    width: 20,
    height: 20,
    textAlign: 'center',
    lineHeight: 18,
  },
  tagSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  tagScrollView: {
    flex: 1,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 20,
  },
  tagItem: {
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  tagItemSelected: {
    backgroundColor: '#FF2442',
    borderColor: '#FF2442',
  },
  tagItemDisabled: {
    opacity: 0.4,
    backgroundColor: '#F0F0F0',
  },
  tagItemText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  tagItemTextSelected: {
    color: '#FFFFFF',
  },
  atModalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  atModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    maxHeight: '70%',
  },
  atModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  atModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  atModalClose: {
    color: '#ACB1C6',
    fontSize: 24,
    fontWeight: 'bold',
  },
  atSearchInput: {
    backgroundColor: '#F6F6FA',
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  atUserList: {
    flex: 1,
  },
  // 修复：完整的atUserRow样式定义
  atUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  // 新增：缺少的atUserAvatar样式
  atUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  atUserInfo: {
    flex: 1,
  },
  atUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  atUserUsername: {
    fontSize: 14,
    color: '#6B7280',
  },
  atUserSelected:
 {
    color: '#FF9317',
    fontSize: 14,
    fontWeight: '600',
  },
  inlineFilterContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    maxHeight: '90%',
  },
  inlineFilterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 0,
  },
  selectedTagsPreview: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
  selectedTagsTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  selectedTagChipText: {
    color: '#4A90E2',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedTagRemove: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
    width: 16,
    height: 16,
    textAlign: 'center',
    lineHeight: 14,
  },
});