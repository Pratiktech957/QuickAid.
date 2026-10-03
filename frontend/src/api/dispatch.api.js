import api from "./api";

const getAdminToken = () => {
    return localStorage.getItem("adminToken");
};

export const dispatchUnit = async (
    emergency_id,
    unit_id
) => {
    return await api("/api/dispatch", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({
            emergency_id,
            unit_id
        })
    });
};

export const updateDispatchStatus = async (
    dispatchId,
    status
) => {
    return await api(
        `/api/dispatch/${dispatchId}/status`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${getAdminToken()}`
            },
            body: JSON.stringify({
                status
            })
        }
    );
};

export const getDispatchByEmergency = async (
    emergencyId
) => {
    return await api(
        `/api/dispatch/emergency/${emergencyId}`,
        {
            headers: {
                Authorization: `Bearer ${getAdminToken()}`
            }
        }
    );
};