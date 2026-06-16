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
    
    if (isCloudinary) {
      // Use Cloudinary's native attachment flag to force a download without a new tab
      const directDownloadUrl = getCloudinaryDownloadUrl(secureUrl, originalName);
      const a = document.createElement("a");
      a.href = directDownloadUrl;
      // We don't need target="_blank" because Cloudinary will return Content-Disposition: attachment
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
    
    // Attempt to fetch the file directly on the client side for non-Cloudinary links
    const response = await fetch(secureUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`);
    }
    
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = originalName || "document";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch (error) {
    console.error("Silent download failed, falling back to new tab:", error);
    // Fallback: open in new tab
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};
