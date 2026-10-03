import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bell,
    Lock,
    LogOut,
    MapPin,
    RefreshCw,
    Save,
    Shield,
    User,
    Zap
} from "lucide-react";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";

function AdminSettings() {
    const navigate = useNavigate();

    const admin = JSON.parse(
        localStorage.getItem("admin")
    );

    const [settings, setSettings] = useState({
        aiClassification: true,
        criticalAlerts: true,
        locationTracking: true,
        dispatchConfirmation: true,
        autoRefresh: true,
        refreshInterval: "30"
    });

    const handleChange = (key) => {
        setSettings((previous) => ({
            ...previous,
            [key]: !previous[key]
        }));
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");

        navigate("/admin/login");
    };

    const handleSave = () => {
        console.log("Settings:", settings);

        // Backend settings API will be connected later.
        alert("Settings saved locally.");
    };

    return (
        <div className="min-h-screen bg-slate-100">

            <AdminSidebar />

            <div className="lg:ml-64">

                <AdminHeader
                    admin={admin}
                    onRefresh={() => window.location.reload()}
                    onLogout={handleLogout}
                />

                <main className="p-6">

                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-900">
                            Settings
                        </h1>

                        <p className="mt-1 text-slate-500">
                            Configure QuickAid emergency response preferences.
                        </p>
                    </div>

                    <div className="mx-auto max-w-5xl space-y-6">

                        {/* Account */}
                        <section className="rounded-xl bg-white shadow-sm">

                            <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
                                <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                                    <User size={20} />
                                </div>

                                <div>
                                    <h2 className="font-bold text-slate-900">
                                        Account
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        Current administrator information
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 p-6 md:grid-cols-2">

                                <div>
                                    <label className="text-sm font-medium text-slate-600">
                                        Name
                                    </label>

                                    <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800">
                                        {admin?.name || "Admin"}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-600">
                                        Username
                                    </label>

                                    <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800">
                                        {admin?.username || "Not available"}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-600">
                                        Department
                                    </label>

                                    <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 capitalize text-slate-800">
                                        {admin?.department || "Not available"}
                                    </div>
                                </div>

                            </div>
                        </section>


                        {/* Emergency Settings */}
                        <section className="rounded-xl bg-white shadow-sm">

                            <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
                                <div className="rounded-lg bg-red-100 p-2 text-red-600">
                                    <Zap size={20} />
                                </div>

                                <div>
                                    <h2 className="font-bold text-slate-900">
                                        Emergency Settings
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        Configure emergency processing and alerts.
                                    </p>
                                </div>
                            </div>

                            <div className="divide-y divide-slate-200">

                                <SettingRow
                                    icon={<Zap size={19} />}
                                    title="AI Emergency Classification"
                                    description="Automatically classify emergency type and severity."
                                    enabled={settings.aiClassification}
                                    onClick={() =>
                                        handleChange("aiClassification")
                                    }
                                />

                                <SettingRow
                                    icon={<Bell size={19} />}
                                    title="Critical Emergency Alerts"
                                    description="Show alerts when a critical emergency is received."
                                    enabled={settings.criticalAlerts}
                                    onClick={() =>
                                        handleChange("criticalAlerts")
                                    }
                                />

                            </div>
                        </section>


                        {/* Response Settings */}
                        <section className="rounded-xl bg-white shadow-sm">

                            <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
                                <div className="rounded-lg bg-green-100 p-2 text-green-600">
                                    <Shield size={20} />
                                </div>

                                <div>
                                    <h2 className="font-bold text-slate-900">
                                        Response Settings
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        Configure response-unit operations.
                                    </p>
                                </div>
                            </div>

                            <div className="divide-y divide-slate-200">

                                <SettingRow
                                    icon={<MapPin size={19} />}
                                    title="Live Location Tracking"
                                    description="Track active response-unit locations."
                                    enabled={settings.locationTracking}
                                    onClick={() =>
                                        handleChange("locationTracking")
                                    }
                                />

                                <SettingRow
                                    icon={<Shield size={19} />}
                                    title="Dispatch Confirmation"
                                    description="Require confirmation before dispatching a unit."
                                    enabled={settings.dispatchConfirmation}
                                    onClick={() =>
                                        handleChange("dispatchConfirmation")
                                    }
                                />

                            </div>
                        </section>


                        {/* System */}
                        <section className="rounded-xl bg-white shadow-sm">

                            <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
                                <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                                    <RefreshCw size={20} />
                                </div>

                                <div>
                                    <h2 className="font-bold text-slate-900">
                                        System
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        Configure dashboard behavior.
                                    </p>
                                </div>
                            </div>

                            <div className="p-6">

                                <SettingRow
                                    icon={<RefreshCw size={19} />}
                                    title="Automatic Refresh"
                                    description="Automatically refresh dashboard information."
                                    enabled={settings.autoRefresh}
                                    onClick={() =>
                                        handleChange("autoRefresh")
                                    }
                                />

                                {settings.autoRefresh && (
                                    <div className="mt-5 max-w-xs">
                                        <label className="text-sm font-medium text-slate-600">
                                            Refresh Interval
                                        </label>

                                        <select
                                            value={settings.refreshInterval}
                                            onChange={(e) =>
                                                setSettings((previous) => ({
                                                    ...previous,
                                                    refreshInterval:
                                                        e.target.value
                                                }))
                                            }
                                            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-red-500"
                                        >
                                            <option value="15">
                                                15 seconds
                                            </option>

                                            <option value="30">
                                                30 seconds
                                            </option>

                                            <option value="60">
                                                1 minute
                                            </option>

                                            <option value="120">
                                                2 minutes
                                            </option>
                                        </select>
                                    </div>
                                )}

                            </div>
                        </section>


                        {/* Security */}
                        <section className="rounded-xl bg-white shadow-sm">

                            <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
                                <div className="rounded-lg bg-orange-100 p-2 text-orange-600">
                                    <Lock size={20} />
                                </div>

                                <div>
                                    <h2 className="font-bold text-slate-900">
                                        Security
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        Manage your administrator session.
                                    </p>
                                </div>
                            </div>

                            <div className="p-6">

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-100"
                                >
                                    <LogOut size={18} />
                                    Logout from QuickAid
                                </button>

                            </div>
                        </section>


                        {/* Save */}
                        <div className="flex justify-end pb-8">

                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-red-700"
                            >
                                <Save size={18} />
                                Save Settings
                            </button>

                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}


function SettingRow({
    icon,
    title,
    description,
    enabled,
    onClick
}) {
    return (
        <div className="flex items-center justify-between gap-5 px-6 py-5">

            <div className="flex items-start gap-4">

                <div className="mt-1 text-slate-500">
                    {icon}
                </div>

                <div>
                    <h3 className="font-semibold text-slate-800">
                        {title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        {description}
                    </p>
                </div>

            </div>

            <button
                onClick={onClick}
                className={`relative h-6 w-11 flex-shrink-0 rounded-full transition ${enabled
                        ? "bg-red-600"
                        : "bg-slate-300"
                    }`}
            >
                <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${enabled
                            ? "left-6"
                            : "left-1"
                        }`}
                />
            </button>

        </div>
    );
}

export default AdminSettings;