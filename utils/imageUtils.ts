// 获取图片显示 URL
export function getImageDisplayUrl(imageUrl: string | null | undefined, baseUrl: string = 'https://api.campusinone.com'): string {
  if (!imageUrl) {
    return '';
  }

  // 如果已经是完整的 URL，直接返回
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // 如果是相对路径，拼接 base URL
  if (imageUrl.startsWith('/')) {
    return `${baseUrl}${imageUrl}`;
  }

  return `${baseUrl}/${imageUrl}`;
}

// 验证图片 URL 是否有效
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// 获取图片文件扩展名
export function getImageExtension(url: string): string {
  const match = url.match(/\.([a-zA-Z0-9]+)(\?|$)/);
  return match ? match[1].toLowerCase() : '';
}

// 判断是否是支持的图片格式
export function isSupportedImageFormat(url: string): boolean {
  const extension = getImageExtension(url);
  const supportedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
  return supportedFormats.includes(extension);
}
