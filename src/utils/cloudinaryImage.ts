/**
 * Transforms a Cloudinary URL to request the best quality
 * and auto format (WebP/AVIF) without resizing.
 */
export function getOptimizedImageUrl(url: string): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;

  return url.replace('/upload/', '/upload/q_auto:best,f_auto/');
}
