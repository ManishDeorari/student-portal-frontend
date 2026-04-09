const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const getProfileById = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}/api/user/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return await res.json();
};
