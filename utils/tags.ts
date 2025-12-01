// 从文本中提取所有 hashtag
export function extractHashtags(text: string): string[] {
  if (!text) return [];
  
  // 匹配 #后面跟着的非空白字符
  const hashtagRegex = /#([^\s#]+)/g;
  const matches = text.match(hashtagRegex);
  
  if (!matches) return [];
  
  // 移除 # 符号并去重
  return [...new Set(matches.map(tag => tag.substring(1)))];
}

// 从文本中移除所有 hashtag
export function stripHashtags(text: string): string {
  if (!text) return '';
  
  return text.replace(/#[^\s#]+/g, '').trim();
}

// 验证 hashtag 是否有效
export function isValidHashtag(tag: string): boolean {
  if (!tag) return false;
  
  // hashtag 不能只包含数字，至少要有一个字母
  return /[a-zA-Z]/.test(tag) && tag.length > 0 && tag.length <= 50;
}

// 格式化 hashtag（确保有 # 前缀）
export function formatHashtag(tag: string): string {
  if (!tag) return '';
  
  const cleaned = tag.trim();
  return cleaned.startsWith('#') ? cleaned : `#${cleaned}`;
}

// 将 hashtag 数组转换为字符串（逗号分隔）
export function tagsToString(tags: string[]): string {
  return tags.filter(tag => isValidHashtag(tag)).join(',');
}

// 将字符串转换为 hashtag 数组
export function stringToTags(str: string): string[] {
  if (!str) return [];
  
  return str.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
}
