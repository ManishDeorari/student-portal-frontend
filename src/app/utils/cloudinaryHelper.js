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
    // If it's a Cloudinary URL, ensure it's HTTPS
    const secureUrl = url.replace('http://', 'https://');
    
    // Fetch the file as a Blob
    const response = await fetch(secureUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const blob = await response.blob();
    
    // Create a local object URL
    const blobUrl = window.URL.createObjectURL(blob);
    
    // Trigger download
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = originalName || "download";
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed, falling back to new tab:", error);
    // Fallback: open in new tab if fetch fails due to CORS or other errors
    const a = document.createElement("a");
    a.href = url;
    a.download = originalName || "download";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};
