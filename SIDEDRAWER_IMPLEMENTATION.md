# 侧边栏（SideDrawer）实现说明

## 📱 功能概述

已成功将独立的 Profile 页面改造为从左侧滑出的侧边栏（Drawer），占据屏幕宽度的 80%。

## ✨ 主要特性

### 1. **滑动动画**
- 从左侧平滑滑入/滑出
- 动画时长：300ms
- 使用原生驱动优化性能

### 2. **交互体验**
- 点击左上角头像按钮打开侧边栏
- 点击背景遮罩关闭侧边栏
- 点击菜单项后自动关闭侧边栏
- 延迟导航确保动画完成

### 3. **UI 设计**
- 占据屏幕宽度的 80%
- 半透明黑色背景遮罩
- 卡片式菜单项设计
- 阴影效果提升层次感

## 📂 文件结构

```
components/
  └── SideDrawer.tsx       # 侧边栏组件

app/
  └── index.tsx            # 主页面（集成侧边栏）
```

## 🔧 实现细节

### SideDrawer 组件

**位置**: `components/SideDrawer.tsx`

**Props**:
```typescript
interface SideDrawerProps {
  isOpen: boolean;           // 控制侧边栏开关
  onClose: () => void;       // 关闭回调
  userProfile: {             // 用户信息
    id: string;
    username: string;
    real_name?: string;
    avatar?: string;
  };
}
```

**主要功能**:
1. **用户信息区域**
   - 头像显示
   - 用户名
   - 用户 ID
   - 编辑按钮

2. **菜单项**
   - 我的收藏 → `/my-favorites`
   - 发送记录 → `/previous-posts`
   - 通用设置 → `/general-settings`
   - 帮助与支持 → `/help-support`
   - 隐私政策 → `/privacy-policy`
   - 使用规范 → `/terms-of-service`
   - 切换账号/退出登录 → `/login`

### Index 页面集成

**位置**: `app/index.tsx`

**新增状态**:
```typescript
const [drawerOpen, setDrawerOpen] = useState(false);
const [userProfile] = useState({
  id: '1',
  username: '校园林克',
  real_name: 'Campus Link User',
});
```

**使用方式**:
```tsx
<SideDrawer
  isOpen={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  userProfile={userProfile}
/>
```

**触发方式**:
```tsx
<TouchableOpacity onPress={() => setDrawerOpen(true)}>
  <View style={styles.profileAvatar}>
    <Text>👤</Text>
  </View>
</TouchableOpacity>
```

## 🎨 样式特点

### 尺寸布局
```typescript
const DRAWER_WIDTH = SCREEN_WIDTH * 0.8;  // 80% 屏幕宽度
```

### 层级关系
- 背景遮罩: `zIndex: 999`
- 侧边栏: `zIndex: 1000`

### 颜色方案
- 主背景: `#FFFFFF`
- 遮罩: `rgba(0, 0, 0, 0.5)`
- 用户名: `#475569`
- 用户 ID: `#ACB1C6`
- 菜单文本: `#475569`
- 箭头: `#CBD5E1`

### 卡片阴影
```javascript
shadowColor: '#0000000D',
shadowOpacity: 0.05,
shadowOffset: { width: 0, height: 2 },
shadowRadius: 8,
elevation: 2,
```

## 🔄 动画流程

### 打开侧边栏
1. 用户点击头像
2. `setDrawerOpen(true)`
3. `setShouldRender(true)` - 渲染组件
4. 动画执行：`translateX: -DRAWER_WIDTH → 0`
5. 背景遮罩淡入

### 关闭侧边栏
1. 用户点击遮罩或菜单项
2. 动画执行：`translateX: 0 → -DRAWER_WIDTH`
3. 背景遮罩淡出
4. 动画完成后 `setShouldRender(false)` - 卸载组件

## 📋 菜单项配置

每个菜单项包含：
- **图标**: 使用 `assets/images/` 中的图片
- **文本**: 中文描述
- **箭头**: 右侧 "›" 符号（除退出登录外）
- **跳转**: 点击后导航到对应页面

### 图标映射
```
我的收藏    → my_favorite.png
发送记录    → previous_post.png
通用        → general_settings.png
帮助与支持  → help_support.png
隐私政策    → privacy_notice.png
使用规范    → term_of_use.png
退出登录    → switch_account.png
```

## 🚀 使用指南

### 1. 在其他页面使用

如果需要在其他页面也添加侧边栏：

```tsx
import SideDrawer from '@/components/SideDrawer';

export default function MyPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userProfile] = useState({
    id: '1',
    username: '校园林克',
  });

  return (
    <View style={{ flex: 1 }}>
      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        userProfile={userProfile}
      />
      
      {/* 触发按钮 */}
      <TouchableOpacity onPress={() => setDrawerOpen(true)}>
        <Text>打开菜单</Text>
      </TouchableOpacity>
      
      {/* 其他内容 */}
    </View>
  );
}
```

### 2. 自定义用户信息

```tsx
const [userProfile] = useState({
  id: '123',
  username: '自定义用户名',
  real_name: '真实姓名',
  avatar: 'https://example.com/avatar.jpg', // 可选
});
```

### 3. 添加新菜单项

在 `SideDrawer.tsx` 中添加：

```tsx
<TouchableOpacity
  style={styles.menuItem}
  onPress={() => handleMenuPress('/new-page')}
>
  <View style={styles.menuItemLeft}>
    <View style={styles.menuIconContainer}>
      <Image
        source={require('@/assets/images/new_icon.png')}
        style={styles.menuIcon}
      />
    </View>
    <Text style={styles.menuText}>新菜单项</Text>
  </View>
  <Text style={styles.menuArrow}>›</Text>
</TouchableOpacity>
```

## 🎯 与原 Profile 页面的区别

| 特性 | 原 Profile 页面 | 新侧边栏 |
|------|----------------|---------|
| 显示方式 | 独立页面 | 左侧滑出 |
| 占用空间 | 全屏 | 80% 宽度 |
| 背景处理 | 不适用 | 半透明遮罩 |
| 关闭方式 | 返回按钮 | 点击遮罩/自动 |
| 动画效果 | 页面切换 | 滑动动画 |
| 用户体验 | 需要切换页面 | 快速访问 |

## ⚠️ 注意事项

1. **性能优化**
   - 使用 `useNativeDriver: true` 优化动画性能
   - 侧边栏关闭后完全卸载，节省内存

2. **触摸区域**
   - 确保遮罩覆盖整个屏幕
   - 避免触摸穿透到下层内容

3. **导航延迟**
   - 菜单项点击后延迟 300ms 导航
   - 确保关闭动画完成后再切换页面

4. **图片资源**
   - 确保所有图标文件存在于 `assets/images/` 目录
   - 如缺少图标，会导致显示错误

## 🔮 未来增强

可以考虑添加：
- [ ] 手势滑动打开/关闭
- [ ] 自定义侧边栏宽度
- [ ] 右侧滑出选项
- [ ] 多级菜单支持
- [ ] 主题色自定义
- [ ] 用户头像上传/显示

## 📝 总结

✅ **已完成**：
- 侧边栏组件创建
- 主页面集成
- 动画效果实现
- 菜单项配置
- 用户信息显示

✅ **优势**：
- 更好的用户体验
- 快速访问个人功能
- 不打断当前浏览
- 符合现代 APP 设计规范
