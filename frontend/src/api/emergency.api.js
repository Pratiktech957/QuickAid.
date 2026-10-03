import api from "./api";

export const createEmergency = async (emergencyData) => {
    return await api("/api/emergency", {
        method: "POST",
        body: JSON.stringify(emergencyData)
    });
};

export const trackEmergency = async (trackingToken) => {
    return await api(
        `/api/emergency/track/${trackingToken}`
    );
};

export const getUserEmergencies = async (mobile) => {
    return await api(
        `/api/emergency/user/${mobile}`
    );
};

export const getAllEmergencies = async () => {
    return await api(
        "/api/emergency",
        {
            headers: {
                Authorization:
                    `Bearer ${localStorage.getItem("adminToken")}`
            }
        }
    );
};

export const getEmergenciesByDepartment = async (
    department
) => {
    return await api(
        `/api/emergency/department/${department}`,
        {
            headers: {
                Authorization:
                    `Bearer ${localStorage.getItem("adminToken")}`
            }
        }
    );
};

export const updateEmergencyStatus = async (
    id,
    status
) => {
    return await api(
        `/api/emergency/${id}/status`,
        {
            method: "PUT",
            headers: {
                Authorization:
                    `Bearer ${localStorage.getItem("adminToken")}`
            },
            body: JSON.stringify({
                status
            })
        }
    );
};

export const assignDepartment = async (
    id,
    department,
    notes = ""
) => {
    return await api(
        `/api/emergency/${id}/department`,
        {
            method: "PUT",
            headers: {
                Authorization:
                    `Bearer ${localStorage.getItem("adminToken")}`
            },
            body: JSON.stringify({
                department,
                notes
            })
        }
    );
};

export const getEmergencyLogs = async (id) => {
    return await api(
        `/api/emergency/${id}/logs`,
        {
            headers: {
                Authorization:
                    `Bearer ${localStorage.getItem("adminToken")}`
            }
        }
    );
};

export const getEmergencyById = async (id) => {
    return await api(
        `/api/emergency/${id}`,
        {
            headers: {
                Authorization:
                    `Bearer ${localStorage.getItem("adminToken")}`
            }
        }
    );
};