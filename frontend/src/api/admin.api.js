import api from "./api";

export const adminSignup = async (adminData) => {
    return await api("/api/admin/signup", {
        method: "POST",
        body: JSON.stringify(adminData)
    });
};

export const adminLogin = async (loginData) => {
    return await api("/api/admin/login", {
        method: "POST",
        body: JSON.stringify(loginData)
    });
};