import api from "./api";

export const createResponseUnit = async (unitData) => {
    return await api("/api/response-units", {
        method: "POST",
        headers: {
            Authorization:
                `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify(unitData)
    });
};

export const getResponseUnits = async () => {
    return await api("/api/response-units", {
        headers: {
            Authorization:
                `Bearer ${localStorage.getItem("adminToken")}`
        }
    });
};

export const getAvailableUnits = async (
    department,
    unitType
) => {
    const params = new URLSearchParams();

    if (department) {
        params.append("department", department);
    }

    if (unitType) {
        params.append("unit_type", unitType);
    }

    const queryString = params.toString();

    return await api(
        `/api/response-units/available${queryString ? `?${queryString}` : ""
        }`,
        {
            headers: {
                Authorization:
                    `Bearer ${localStorage.getItem("adminToken")}`
            }
        }
    );
};