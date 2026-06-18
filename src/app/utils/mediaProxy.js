export const getProxiedMediaUrl = (url, isInline = true) => {
  if (!url) return url;
  
  // Only proxy Cloudinary URLs
  if (!url.includes("res.cloudinary.com")) return url;

  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  // Fallback to original URL if no token is available (though it will likely fail if proxy requires auth)
  if (!token) return url;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  
  return `${baseUrl}/api/files/proxy?url=${encodeURIComponent(url)}&token=${token}&inline=${isInline}`;
};
