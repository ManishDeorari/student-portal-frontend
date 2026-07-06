import axios from "axios";
import imageCompression from "browser-image-compression";

const BASE = process.env.NEXT_PUBLIC_API_URL + "/api";

const uploadToCloudinaryWithProgress = async (file, folder, uploadUrl, onProgress) => {
  let fileToUpload = file;
  if (file.type && file.type.startsWith("image/") && !file.type.includes("gif")) {
    try {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
      fileToUpload = await imageCompression(file, options);
    } catch (error) {
      console.error("Image compression error:", error);
    }
  }

  const data = new FormData();
  data.append("file", fileToUpload);
  data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  data.append("folder", folder);

  const response = await axios.post(uploadUrl, data, {
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
  return response.data;
};

// ================== FETCH POSTS ==================
export const fetchPosts = async (page = 1, limit = 10, type = "Regular") => {
  const res = await fetch(`${BASE}/posts?page=${page}&limit=${limit}&type=${type}`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
};

export const checkEnrollmentNumber = async (enrollmentNumber) => {
  const res = await fetch(`${BASE}/user/check-enrollment?enrollmentNumber=${enrollmentNumber}`);
  if (!res.ok) throw new Error("Failed to check enrollment number");
  return res.json();
};

// ================== EVENT REPOSTS ==================
export const fetchEventReposts = async (eventId) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}/events/${eventId}/reposts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch event reposts');
  return res.json();
};

export const downloadEventRepostsCSV = async (eventId, title) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}/events/${eventId}/reposts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch event reposts');
  
  const data = await res.json();
  const reposts = data.reposts || [];
  
  if (reposts.length === 0) {
    throw new Error('No reposts found for this event');
  }

  // Define CSV headers
  const headers = ['Name', 'Enrollment Number', 'Email', 'Phone Number', 'Course', 'Course Year', 'Branch Name'];
  
  // Create CSV rows
  const csvRows = [
    headers.join(','),
    ...reposts.map(r => {
      const u = r.user || {};
      return [
        `"${u.name || ''}"`,
        `"${u.enrollmentNumber || ''}"`,
        `"${u.email || ''}"`,
        `"${u.phoneNumber || ''}"`,
        `"${u.course || ''}"`,
        `"${u.courseYear || ''}"`,
        `"${u.branch || ''}"`
      ].join(',');
    })
  ];
  
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Reposts_${title.replace(/[^a-z0-9]/gi, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const createPost = async (contentOrData, image, video, type = "Regular", documents = [], customFolders = {}, onProgress = null) => {
  let imageObjects = [];
  let videoObject = null;
  let documentObjects = [];

  const RAW_UPLOAD_URL = process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL?.replace('/image/upload', '/raw/upload') || "https://api.cloudinary.com/v1_1/djw8l0wxn/raw/upload";

  const isStructured = typeof contentOrData === "object" && contentOrData !== null;
  const content = isStructured ? contentOrData.content : contentOrData;
  const finalType = isStructured ? (contentOrData.type || type) : type;

  if (!content?.trim()) {
    return { message: "Failed to create post - No text or emoji." };
  }

  // ✅ Upload multiple images
  if (image && image.length > 0) {
    console.group("📤 Uploading Images to Cloudinary");
    for (let img of image) {
      try {
        const uploadJson = await uploadToCloudinaryWithProgress(img, customFolders.images || "student/images", process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL, null);
        if (uploadJson.secure_url && uploadJson.public_id) {
          const shortFileName = `${uploadJson.public_id}.${uploadJson.format}`;
          imageObjects.push({
            url: shortFileName, // Sending short filename for R2 migration
            public_id: uploadJson.public_id,
          });
          console.log("✅ Image uploaded (short name):", shortFileName);
        }
      } catch (err) {
        console.error("❌ Image upload failed:", err);
      }
    }
    console.groupEnd();
  }

  // ✅ Upload video
  if (video) {
    console.group("🎥 Uploading Video to Cloudinary");
    try {
      const uploadJson = await uploadToCloudinaryWithProgress(video, customFolders.videos || "student/videos", process.env.NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_URL, onProgress);
      if (uploadJson.secure_url && uploadJson.public_id) {
        const shortFileName = `${uploadJson.public_id}.${uploadJson.format}`;
        videoObject = {
          url: shortFileName, // Sending short filename for R2 migration
          public_id: uploadJson.public_id,
        };
        console.log("✅ Video uploaded (short name):", shortFileName);
      }
    } catch (err) {
      console.error("❌ Video upload failed:", err);
    }
    console.groupEnd();
  }

  // ✅ Upload documents
  if (documents && documents.length > 0) {
    console.group("📄 Uploading Documents to Cloudinary");
    for (let doc of documents) {
      try {
        const uploadJson = await uploadToCloudinaryWithProgress(doc, "student/documents", RAW_UPLOAD_URL, !video ? onProgress : null);
        if (uploadJson.secure_url && uploadJson.public_id) {
          const docFormat = doc.name.split('.').pop();
          const shortFileName = `${uploadJson.public_id}.${docFormat}`;
          documentObjects.push({
            url: shortFileName, // Sending short filename for R2 migration
            public_id: uploadJson.public_id,
            original_filename: doc.name,
            format: docFormat,
          });
          console.log("✅ Document uploaded (short name):", shortFileName);
        }
      } catch (err) {
        console.error("❌ Document upload failed:", err);
      }
    }
    console.groupEnd();
  }

  // ✅ Send to backend
  const res = await fetch(`${BASE}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      ...(isStructured ? contentOrData : { content, type: finalType }),
      images: imageObjects,
      video: videoObject,
      documents: documentObjects,
    }),
  });

  const data = await res.json();
  return data;
};

// ================== ANNOUNCEMENTS ==================
export const createAnnouncement = async (announcementData, images = [], video = null, documents = [], onProgress = null) => {
  let imageObjects = [];
  let videoObject = null;
  let documentObjects = [];

  const RAW_UPLOAD_URL = process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL?.replace('/image/upload', '/raw/upload') || "https://api.cloudinary.com/v1_1/djw8l0wxn/raw/upload";

  // 1. Upload Images
  if (images && images.length > 0) {
    for (let img of images) {
      try {
        const uploadJson = await uploadToCloudinaryWithProgress(img, "student/announcements/images", process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL, null);
        if (uploadJson.secure_url && uploadJson.public_id) {
          imageObjects.push({ url: uploadJson.secure_url, public_id: uploadJson.public_id });
        }
      } catch (err) {
        console.error("❌ Image upload failed:", err);
      }
    }
  }

  // 2. Upload Video
  if (video) {
    try {
      const uploadJson = await uploadToCloudinaryWithProgress(video, "student/announcements/videos", process.env.NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_URL, onProgress);
      if (uploadJson.secure_url && uploadJson.public_id) {
        videoObject = { url: uploadJson.secure_url, public_id: uploadJson.public_id };
      }
    } catch (err) {
      console.error("❌ Video upload failed:", err);
    }
  }

  // 3. Upload Documents
  if (documents && documents.length > 0) {
    for (let doc of documents) {
      try {
        const uploadJson = await uploadToCloudinaryWithProgress(doc, "student/announcements/documents", RAW_UPLOAD_URL, !video ? onProgress : null);
        if (uploadJson.secure_url && uploadJson.public_id) {
          documentObjects.push({
            url: uploadJson.secure_url,
            public_id: uploadJson.public_id,
            original_filename: doc.name,
            format: doc.name.split('.').pop(),
          });
        }
      } catch (err) {
        console.error("❌ Document upload failed:", err);
      }
    }
  }

  const res = await fetch(`${BASE}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ 
      ...announcementData, 
      images: imageObjects, 
      video: videoObject,
      documents: documentObjects,
      type: "Announcement" 
    }),
  });
  return res.json();
};

export const fetchPendingPointsRequests = async () => {
  const res = await fetch(`${BASE}/points-requests/pending`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch points requests");
  return res.json();
};

export const approvePointsRequest = async (postId, action, awardedPoints = undefined) => {
  const payload = { action };
  if (awardedPoints !== undefined) payload.awardedPoints = awardedPoints;
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}/points-requests/${postId}/action`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action, awardedPoints }),
  });
  if (!res.ok) throw new Error("Failed to process request");
  return res.json();
};

export const fetchPendingProfilePointsRequests = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}/points-requests/profile/pending`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch profile points requests");
  return res.json();
};

export const approveProfilePointsRequest = async (userId, field, action) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}/points-requests/profile/${userId}/action`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action, field }),
  });
  if (!res.ok) throw new Error("Failed to process request");
  return res.json();
};



export const searchUsers = async (query, role = null) => {
  try {
    let url = `${BASE}/user/search?q=${encodeURIComponent(query)}`;
    if (role) url += `&role=${role}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!res.ok) throw new Error("Search failed");
    return await res.json();
  } catch (error) {
    console.error("searchUsers() error:", error.message);
    throw error;
  }
};

// ================== COMMENT ON POST ==================
export const commentOnPost = async (postId, text) => {
  try {
    const res = await fetch(`${BASE}/posts/${postId}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ text }), // ✅ fixed key
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Comment failed:", errText);
      throw new Error("Comment API failed");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("commentOnPost() error:", error.message);
    throw error;
  }
};

// ================== LIKE POST ==================
export const likePost = async (postId) => {
  try {
    const res = await fetch(`${BASE}/posts/${postId}/like`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Like failed:", errText);
      throw new Error("Like API failed");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("likePost() error:", error.message);
    throw error;
  }
};

// ================== REACT TO POST ==================
export const reactToPost = async (postId, emoji, action = "add") => {
  try {
    const res = await fetch(`${BASE}/posts/${postId}/react`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ emoji, action }), // ✅ fixed
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Reaction failed:", errText);
      throw new Error("React API failed");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("reactToPost() error:", error.message);
    throw error;
  }
};

// ================== UPDATE POINTS ==================
export const updatePoints = async (amount) => {
  await fetch(`${BASE}/user/points/add`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ amount }),
  });
};

// ================== EDIT COMMENT ==================
export const editComment = async (postId, commentId, newText) => {
  try {
    const res = await fetch(`${BASE}/posts/${postId}/comment/${commentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ text: newText }), // ✅ fixed key
    });

    if (!res.ok) throw new Error("Edit comment failed");
    return await res.json();
  } catch (error) {
    console.error("editComment() error:", error.message);
    throw error;
  }
};
// ================== EVENTS & REGISTRATIONS ==================

export const createEvent = async (eventData, images = [], video = null, documents = [], onProgress = null) => {
  let imageObjects = [];
  let videoObject = null;
  let documentObjects = [];

  const RAW_UPLOAD_URL = process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL?.replace('/image/upload', '/raw/upload') || "https://api.cloudinary.com/v1_1/djw8l0wxn/raw/upload";

  // 1. Upload Images
  if (images && images.length > 0) {
    for (let img of images) {
      try {
        const uploadJson = await uploadToCloudinaryWithProgress(img, "student/events/images", process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL, null);
        if (uploadJson.secure_url && uploadJson.public_id) {
          imageObjects.push({ url: uploadJson.secure_url, public_id: uploadJson.public_id });
        }
      } catch (err) {
        console.error("❌ Image upload failed:", err);
      }
    }
  }

  // 2. Upload Video
  if (video) {
    try {
      const uploadJson = await uploadToCloudinaryWithProgress(video, "student/events/videos", process.env.NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_URL, onProgress);
      if (uploadJson.secure_url && uploadJson.public_id) {
        videoObject = { url: uploadJson.secure_url, public_id: uploadJson.public_id };
      }
    } catch (err) {
      console.error("❌ Video upload failed:", err);
    }
  }

  // 3. Upload Documents
  if (documents && documents.length > 0) {
    for (let doc of documents) {
      try {
        const uploadJson = await uploadToCloudinaryWithProgress(doc, "student/events/documents", RAW_UPLOAD_URL, !video ? onProgress : null);
        if (uploadJson.secure_url && uploadJson.public_id) {
          documentObjects.push({ 
            url: uploadJson.secure_url, 
            public_id: uploadJson.public_id,
            original_filename: uploadJson.original_filename || doc.name,
            format: uploadJson.format || doc.name.split('.').pop()
          });
        }
      } catch (err) {
        console.error("❌ Document upload failed:", err);
      }
    }
  }

  const res = await fetch(`${BASE}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ ...eventData, images: imageObjects, video: videoObject, documents: documentObjects }),
  });
  return res.json();
};

export const fetchEvents = async () => {
  const res = await fetch(`${BASE}/events`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
};

export const registerForEvent = async (registrationData) => {
  const res = await fetch(`${BASE}/registrations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(registrationData),
  });
  return res.json();
};

export const fetchEventRegistrations = async (eventId) => {
  const res = await fetch(`${BASE}/registrations/${eventId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.json();
};

export const downloadEventCSV = async (eventId, eventTitle) => {
  const res = await fetch(`${BASE}/registrations/${eventId}/download`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  
  if (res.ok) {
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations_${eventTitle.replace(/\s+/g, "_")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } else {
    throw new Error("Failed to download CSV");
  }
};
