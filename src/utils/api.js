// frontend/src/utils/api.js

export const fetchWithToken = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Request failed");
  }

  return res.json();
};

export const createPost = async (content, images = [], video = null) => {
  const formData = new FormData();
  formData.append("content", content);
  if (video) {
    formData.append("file", video); // Keep current backend as-is for video
  }
  images.forEach((img) => formData.append("images", img));

  const res = await fetch(`${BASE}/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });

  const data = await res.json();
  await updatePoints(5);
  return data;
};
