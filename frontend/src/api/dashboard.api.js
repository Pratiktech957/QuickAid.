import api from "./api";

export const getDashboardStats = async () => {
    return await api("/api/analytics/stats", {
        headers: {
            Authorization:
                `Bearer ${localStorage.getItem("adminToken")}`
        }
    });
};

export const getEmergencyAnalytics = async () => {
    return await api("/api/analytics/emergencies", {
        headers: {
            Authorization:
                `Bearer ${localStorage.getItem("adminToken")}`
        }
    });
};