/**
 * Smart helper for rendering image URLs during the Cloudinary -> R2 migration.
 * 
 * @param {string} imageKey - The string from the database (could be a full URL or just a filename)
 * @returns {string} The fully qualified image URL
 */
export const getImageUrl = (imageKey) => {
  if (!imageKey) return '/default-avatar.png'; // Fallback for null/undefined

  // If the database already holds a full HTTP URL (e.g. old Cloudinary URL), return it as-is
  if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) {
    return imageKey;
  }

  // If it's just a filename (new upload), prepend the base storage URL.
  // In the future, this env var will point to Cloudflare R2: process.env.NEXT_PUBLIC_STORAGE_URL
  const baseUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'https://res.cloudinary.com/djw8l0wxn/image/upload/'; 
  
  // Ensure we don't have double slashes if baseUrl ends with / and imageKey starts with /
  if (baseUrl.endsWith('/') && imageKey.startsWith('/')) {
    return `${baseUrl}${imageKey.substring(1)}`;
  } else if (!baseUrl.endsWith('/') && !imageKey.startsWith('/') && baseUrl !== '') {
    return `${baseUrl}/${imageKey}`;
  }
  
  return `${baseUrl}${imageKey}`;
};
