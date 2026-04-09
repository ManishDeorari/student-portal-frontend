const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const sendFeedback = async (message) => {
    try {
        const response = await fetch(`${API_URL}/api/notifications/feedback`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to submit feedback");
        
        return data;
    } catch (error) {
        console.error("Error submitting feedback:", error);
        throw error;
    }
};
