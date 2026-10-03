import api from "./api";

// Get dashboard statistics
export const getDashboardStats = async () => {
    return await api("/api/analytics/stats", {
        headers: {
            Authorization:
                `Bearer ${localStorage.getItem("adminToken")}`
        }
    });
};

// Get emergency analytics
export const getEmergencyAnalytics = async () => {
    return await api("/api/analytics/emergencies", {
        headers: {
            Authorization:
                `Bearer ${localStorage.getItem("adminToken")}`
        }
    });
};