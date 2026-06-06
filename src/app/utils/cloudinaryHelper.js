/**
 * Formats a Cloudinary URL to force download with a specific filename.
 */
export const getCloudinaryDownloadUrl = (url, originalName) => {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  if (url.includes("fl_attachment")) return url;

  const parts = url.split("/upload/");
  if (parts.length === 2) {
    const filename = originalName ? encodeURIComponent(originalName) : "document";
    return `${parts[0]}/upload/fl_attachment:${filename}/${parts[1]}`;
  }
  return url;
};

/**
 * Formats a Cloudinary image URL to be optimized (auto quality, auto format).
 */
export const getOptimizedImageUrl = (url) => {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  if (url.includes("q_auto") || url.includes("f_auto")) return url;

  const parts = url.split("/upload/");
  if (parts.length === 2) {
    return `${parts[0]}/upload/q_auto,f_auto/${parts[1]}`;
  }
  return url;
};
