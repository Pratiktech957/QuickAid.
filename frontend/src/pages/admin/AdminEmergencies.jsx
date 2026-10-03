import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    AlertTriangle,
    RefreshCw,
    ShieldAlert,
    Clock,
    Siren
} from "lucide-react";

import {
    getAllEmergencies
} from "../../api/emergency.api";

import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";

import EmergencyList from "../../components/admin/EmergencyList";
import EmergencyDetails from "../../components/admin/EmergencyDetails";

function AdminEmergencies() {
    const navigate = useNavigate();

    // ==========================================
    // ADMIN
    // ==========================================

    const admin = JSON.parse(
        localStorage.getItem("admin") || "null"
    );

    // ==========================================
    // STATE
    // ==========================================

    const [emergencies, setEmergencies] =
        useState([]);

    const [selectedEmergency, setSelectedEmergency] =
        useState(null);

    const [currentFilter, setCurrentFilter] =
        useState("all");

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [sidebarOpen, setSidebarOpen] =
        useState(false);

    // ==========================================
    // AUTH ERROR CHECK
    // ==========================================

    const isAuthError = (error) => {
        const message =
            error?.message?.toLowerCase() || "";

        return (
            message.includes("token") ||
            message.includes("unauthorized") ||
            message.includes("authorization") ||
            message.includes("expired")
        );
    };

    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {
        localStorage.removeItem(
            "adminToken"
        );

        localStorage.removeItem(
            "admin"
        );

        navigate("/admin/login");
    };

    // ==========================================
    // FETCH EMERGENCIES
    // ==========================================

    const fetchEmergencies = async (
        initialLoad = false
    ) => {
        try {
            if (initialLoad) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");

            const response =
                await getAllEmergencies();

            const data =
                response.data || [];

            setEmergencies(data);

            // ==========================================
            // KEEP SELECTED EMERGENCY IN SYNC
            // ==========================================

            setSelectedEmergency(
                (currentSelected) => {
                    if (!currentSelected) {
                        return null;
                    }

                    const updatedEmergency =
                        data.find(
                            (emergency) =>
                                emergency.emergency_id ===
                                currentSelected.emergency_id
                        );

                    return (
                        updatedEmergency ||
                        null
                    );
                }
            );

        } catch (error) {
            console.error(
                "Failed to fetch emergencies:",
                error
            );

            // ==========================================
            // AUTH ERROR
            // ==========================================

            if (isAuthError(error)) {
                handleLogout();
                return;
            }

            setError(
                error?.message ||
                "Failed to load emergency reports."
            );

        } finally {
            if (initialLoad) {
                setLoading(false);
            } else {
                setRefreshing(false);
            }
        }
    };

    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {
        fetchEmergencies(true);
    }, []);

    // ==========================================
    // STATISTICS
    // ==========================================

    const totalEmergencies =
        emergencies.length;

    const activeEmergencies =
        emergencies.filter(
            (emergency) =>
                emergency.status === "pending" ||
                emergency.status === "in_progress"
        ).length;

    const criticalEmergencies =
        emergencies.filter(
            (emergency) =>
                emergency.severity === "critical"
        ).length;

    // ==========================================
    // STATUS STYLE
    // ==========================================

    const getStatusStyle = (status) => {
        const styles = {
            pending:
                "bg-amber-100 text-amber-700",

            in_progress:
                "bg-blue-100 text-blue-700",

            resolved:
                "bg-green-100 text-green-700",

            cancelled:
                "bg-slate-100 text-slate-600"
        };

        return (
            styles[status] ||
            "bg-slate-100 text-slate-600"
        );
    };

    // ==========================================
    // SEVERITY STYLE
    // ==========================================

    const getSeverityStyle = (severity) => {
        const styles = {
            critical:
                "bg-red-100 text-red-700",

            high:
                "bg-orange-100 text-orange-700",

            medium:
                "bg-cyan-100 text-cyan-700",

            low:
                "bg-green-100 text-green-700"
        };

        return (
            styles[severity] ||
            "bg-slate-100 text-slate-600"
        );
    };

    // ==========================================
    // EMERGENCY BORDER
    // ==========================================

    const getEmergencyBorder = (
        emergency
    ) => {
        if (
            emergency.severity ===
            "critical"
        ) {
            return "border-l-red-500";
        }

        if (
            emergency.status ===
            "resolved"
        ) {
            return "border-l-green-500";
        }

        if (
            emergency.status ===
            "cancelled"
        ) {
            return "border-l-slate-400";
        }

        if (
            emergency.status ===
            "in_progress"
        ) {
            return "border-l-blue-500";
        }

        return "border-l-amber-500";
    };

    // ==========================================
    // FORMAT STATUS
    // ==========================================

    const formatStatus = (status) => {
        if (!status) {
            return "";
        }

        return status
            .replace(/_/g, " ")
            .toUpperCase();
    };

    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "N/A";
        }

        return parsedDate.toLocaleString();
    };

    // ==========================================
    // INITIAL LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">

                <div className="text-center">

                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-red-600" />

                    <p className="mt-4 font-medium text-slate-600">
                        Loading emergencies...
                    </p>

                </div>

            </div>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div className="min-h-screen bg-slate-100">

            {/* ==================================
                SIDEBAR
            ================================== */}

            <AdminSidebar
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
            />


            {/* ==================================
                MAIN CONTENT
            ================================== */}

            <div className="min-h-screen lg:ml-64">

                {/* ==================================
                    HEADER
                ================================== */}

                <AdminHeader
                    admin={admin}
                    onRefresh={() =>
                        fetchEmergencies(false)
                    }
                    onLogout={handleLogout}
                    refreshing={refreshing}
                />


                <main className="px-4 py-6 sm:px-6 lg:px-8">

                    {/* ==================================
                        PAGE HEADER
                    ================================== */}

                    <section className="mb-6">

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">

                                    <AlertTriangle
                                        size={22}
                                    />

                                </div>


                                <div>

                                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                        Emergencies
                                    </h1>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Manage and monitor emergency reports.
                                    </p>

                                </div>

                            </div>


                            {/* ==================================
                                REFRESH
                            ================================== */}

                            <button
                                type="button"
                                onClick={() =>
                                    fetchEmergencies(false)
                                }
                                disabled={refreshing}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                <RefreshCw
                                    size={17}
                                    className={
                                        refreshing
                                            ? "animate-spin"
                                            : ""
                                    }
                                />

                                {refreshing
                                    ? "Refreshing..."
                                    : "Refresh"}

                            </button>

                        </div>

                    </section>


                    {/* ==================================
                        ERROR
                    ================================== */}

                    {error && (

                        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                    <p className="font-semibold text-red-800">
                                        Failed to load emergencies
                                    </p>

                                    <p className="mt-1 text-sm text-red-600">
                                        {error}
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={() =>
                                        fetchEmergencies(true)
                                    }
                                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                                >
                                    Try Again
                                </button>

                            </div>

                        </div>
                    )}


                    {/* ==================================
                        SUMMARY
                    ================================== */}

                    <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

                        {/* ==================================
                            TOTAL
                        ================================== */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-sm font-medium text-slate-500">
                                        Total Emergencies
                                    </p>

                                    <p className="mt-2 text-3xl font-bold text-slate-900">
                                        {totalEmergencies}
                                    </p>

                                </div>


                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">

                                    <ShieldAlert
                                        size={21}
                                    />

                                </div>

                            </div>


                            <p className="mt-3 text-xs text-slate-400">
                                All reported emergencies
                            </p>

                        </div>


                        {/* ==================================
                            ACTIVE
                        ================================== */}

                        <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-sm font-medium text-slate-500">
                                        Active Emergencies
                                    </p>

                                    <p className="mt-2 text-3xl font-bold text-slate-900">
                                        {activeEmergencies}
                                    </p>

                                </div>


                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">

                                    <Clock
                                        size={21}
                                    />

                                </div>

                            </div>


                            <p className="mt-3 text-xs text-slate-400">
                                Pending and in-progress reports
                            </p>

                        </div>


                        {/* ==================================
                            CRITICAL
                        ================================== */}

                        <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-sm font-medium text-slate-500">
                                        Critical Emergencies
                                    </p>

                                    <p className="mt-2 text-3xl font-bold text-slate-900">
                                        {criticalEmergencies}
                                    </p>

                                </div>


                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">

                                    <Siren
                                        size={21}
                                    />

                                </div>

                            </div>


                            <p className="mt-3 text-xs text-slate-400">
                                Immediate attention required
                            </p>

                        </div>

                    </section>


                    {/* ==================================
                        EMERGENCY MANAGEMENT
                    ================================== */}

                    <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">

                        {/* ==================================
                            EMERGENCY LIST
                        ================================== */}

                        <EmergencyList
                            emergencies={
                                emergencies
                            }

                            currentFilter={
                                currentFilter
                            }

                            setCurrentFilter={
                                setCurrentFilter
                            }

                            setSelectedEmergency={
                                setSelectedEmergency
                            }

                            getEmergencyBorder={
                                getEmergencyBorder
                            }

                            getStatusStyle={
                                getStatusStyle
                            }

                            getSeverityStyle={
                                getSeverityStyle
                            }

                            formatStatus={
                                formatStatus
                            }

                            formatDate={
                                formatDate
                            }

                            onUpdated={() =>
                                fetchEmergencies(false)
                            }
                        />


                        {/* ==================================
                            EMERGENCY DETAILS
                        ================================== */}

                        <EmergencyDetails
                            emergency={
                                selectedEmergency
                            }

                            getSeverityStyle={
                                getSeverityStyle
                            }

                            formatStatus={
                                formatStatus
                            }

                            formatDate={
                                formatDate
                            }

                            onUpdated={() =>
                                fetchEmergencies(false)
                            }
                        />

                    </section>

                </main>

            </div>

        </div>
    );
}

export default AdminEmergencies;