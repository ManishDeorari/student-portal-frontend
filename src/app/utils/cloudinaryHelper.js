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
    const isCloudinary = secureUrl.includes("res.cloudinary.com");
    
    let downloadUrl = secureUrl;

    if (isCloudinary) {
      downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/files/proxy?url=${encodeURIComponent(secureUrl)}&name=${encodeURIComponent(originalName || "document")}`;
      const token = localStorage.getItem("token");
      if (token) {
        downloadUrl += `&token=${token}`;
      }
    }
    
    // Trigger download securely without exposing the Cloudinary URL.
    // Since the backend sets Content-Disposition: attachment, it will download seamlessly.
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = originalName || "download";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error("Download failed:", error);
    // Ultimate fallback if something completely breaks
    window.open(url, "_blank");
  }
};
