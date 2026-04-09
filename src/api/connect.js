// src/api/connect.js
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const getToken = () => localStorage.getItem("token");

export const sendConnectionRequest = async (toUserId) => {
  const res = await fetch(`${BASE_URL}/api/connect/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ to: toUserId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

export const acceptConnectionRequest = async (fromUserId) => {
  const res = await fetch(`${BASE_URL}/api/connect/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ from: fromUserId }), // Backend expects { from }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Accept failed");
  return data;
};

export const rejectConnectionRequest = async (fromUserId) => {
  const res = await fetch(`${BASE_URL}/api/connect/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ from: fromUserId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Reject failed");
  return data;
};

export const cancelConnectionRequest = async (toUserId) => {
  const res = await fetch(`${BASE_URL}/api/connect/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ toUserId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Cancel failed");
  return data;
};

export const getPendingRequests = async () => {
  const res = await fetch(`${BASE_URL}/api/connect/pending`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Fetch pending failed");
  return data;
};

export const getSentRequests = async () => {
  const res = await fetch(`${BASE_URL}/api/connect/sent`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Fetch sent requests failed");
  return data;
};

export const getMyConnections = async () => {
  const res = await fetch(`${BASE_URL}/api/connect/list`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Fetch connections failed");
  return data;
};

export const getUserConnections = async (userId) => {
  const res = await fetch(`${BASE_URL}/api/connect/user/${userId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Fetch user connections failed");
  return data;
};
