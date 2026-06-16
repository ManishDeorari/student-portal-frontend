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

/**
 * Fetches the file and forces a silent download to avoid opening a new tab
 * and hides the raw Cloudinary URL.
 */
export const downloadFileSilently = async (url, originalName) => {
  try {
    const secureUrl = url.replace('http://', 'https://');
    const isCloudinary = secureUrl.includes("res.cloudinary.com");
    
    // For Cloudinary files (like images/videos), we can force a native download using fl_attachment
    if (isCloudinary) {
      const directDownloadUrl = getCloudinaryDownloadUrl(secureUrl, originalName);
      const a = document.createElement("a");
      a.href = directDownloadUrl;
      // Appending to body and clicking triggers the download natively
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
    
    // For non-Cloudinary files, just open in a new tab and let the browser handle it
    window.open(secureUrl, "_blank");
  } catch (error) {
    console.error("Silent download failed, falling back to new tab:", error);
    window.open(url, "_blank");
  }
};
