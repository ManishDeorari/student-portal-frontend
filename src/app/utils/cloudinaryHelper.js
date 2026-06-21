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
 * Formats a Cloudinary image URL to use focal point cropping
 */
export const getFocalImageUrl = (url, width, height, focus = null) => {
  if (!url || !url.includes("res.cloudinary.com")) return url;

  // Remove existing transformations
  let cleanUrl = url;
  if (url.includes("/upload/")) {
    const parts = url.split("/upload/");
    if (parts[1].match(/^[a-z_]+,[a-z_]+(,[a-z0-9_]+)*\//)) {
      parts[1] = parts[1].substring(parts[1].indexOf('/') + 1);
    }
    cleanUrl = `${parts[0]}/upload/${parts[1]}`;
  }

  const parts = cleanUrl.split("/upload/");
  if (parts.length === 2) {
    let transform = `c_fill,q_auto,f_auto`;
    if (width) transform += `,w_${width}`;
    if (height) transform += `,h_${height}`;
    if (focus && focus.x !== undefined && focus.y !== undefined) {
      transform += `,g_xy_center,x_${Math.round(focus.x)},y_${Math.round(focus.y)}`;
    } else {
      transform += `,g_auto`; // default focus
    }
    return `${parts[0]}/upload/${transform}/${parts[1]}`;
  }
  return cleanUrl;
};

/**
 * Fetches the file and forces a silent download to avoid opening a new tab
 * and hides the raw Cloudinary URL.
 */
export const downloadFileSilently = async (url, originalName) => {
  if (!url) return;
  
  if (!url.includes("res.cloudinary.com")) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  try {
    const secureUrl = url.replace('http://', 'https://');
    
    // Attempt to fetch the file directly on the client side
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
