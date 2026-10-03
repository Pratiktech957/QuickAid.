import { Navigate } from "react-router-dom";

import PoliceDashboard from "./dashboards/PoliceDashboard";
import MedicalDashboard from "./dashboards/MedicalDashboard";
import FireDashboard from "./dashboards/FireDashboard";
import SuperadminDashboard from "./dashboards/SuperadminDashboard";

function AdminDashboard() {
    const admin = JSON.parse(
        localStorage.getItem("admin") || "null"
    );

    if (!admin) {
        return (
            <Navigate
                to="/admin/login"
                replace
            />
        );
    }

    switch (admin.department) {
        case "police":
            return <PoliceDashboard />;

        case "medical":
            return <MedicalDashboard />;

        case "fire":
            return <FireDashboard />;

        case "superadmin":
            return <SuperadminDashboard />;

        default:
            return (
                <Navigate
                    to="/admin/login"
                    replace
                />
            );
    }
}

export default AdminDashboard;