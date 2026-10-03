import { Routes, Route } from "react-router-dom";

import AdminLogin from "../pages/admin/AdminLogin";
import AdminSignup from "../pages/admin/AdminSignup";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminEmergencies from "../pages/admin/AdminEmergencies";
import AdminLiveMap from "../pages/admin/AdminLiveMap";
import AdminAnalytics from "../pages/admin/AdminAnalytics";
import AdminResponseUnits from "../pages/admin/AdminResponseUnits";
import AdminSettings from "../pages/admin/AdminSettings";

function AdminRouter() {

    return (

        <Routes>

            {/* Admin Authentication */}

            <Route
                path="/login"
                element={<AdminLogin />}
            />

            <Route
                path="/signup"
                element={<AdminSignup />}
            />


            {/* Admin Dashboard */}

            <Route
                path="/dashboard"
                element={<AdminDashboard />}
            />


            {/* Emergency Management */}

            <Route
                path="/emergencies"
                element={<AdminEmergencies />}
            />


            {/* Live Map */}

            <Route
                path="/live-map"
                element={<AdminLiveMap />}
            />


            {/* Analytics */}

            <Route
                path="/analytics"
                element={<AdminAnalytics />}
            />


            {/* Response Units */}

            <Route
                path="/response-units"
                element={<AdminResponseUnits />}
            />


            {/* Settings */}

            <Route
                path="/settings"
                element={<AdminSettings />}
            />

        </Routes>

    );
}

export default AdminRouter;