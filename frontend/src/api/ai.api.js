import api from "./api";

export const askAI = async (data) => {
    return await api("/api/ai", {
        method: "POST",
        body: JSON.stringify(data)
    });
};