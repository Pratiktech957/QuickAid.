import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Activity,
    AlertCircle,
    BarChart3,
    CheckCircle2,
    Clock3,
    Flame,
    HeartPulse,
    LogOut,
    MapPin,
    RefreshCw,
    Shield,
    Siren,
    Users
} from "lucide-react";

import {
    getAllEmergencies
} from "../../../api/emergency.api";

function SuperadminDashboard() {
    const navigate = useNavigate();

    const admin = JSON.parse(
        localStorage.getItem("admin") || "null"
    );

    const [emergencies, setEmergencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");

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

            setEmergencies(
                response.data || []
            );
        } catch (error) {
            console.error(
                "Superadmin dashboard error:",
                error
            );

            const message =
                error?.message?.toLowerCase() || "";

            if (
                message.includes("token") ||
                message.includes("unauthorized") ||
                message.includes("authorization") ||
                message.includes("expired")
            ) {
                localStorage.removeItem(
                    "adminToken"
                );

                localStorage.removeItem(
                    "admin"
                );

                navigate("/admin/login");

                return;
            }

            setError(
                error?.message ||
                "Failed to load system emergencies."
            );
        } finally {
            if (initialLoad) {
                setLoading(false);
            } else {
                setRefreshing(false);
            }
        }
    };

    useEffect(() => {
        const token =
            localStorage.getItem(
                "adminToken"
            );

        if (!token || !admin) {
            navigate("/admin/login");
            return;
        }

        fetchEmergencies(true);
    }, []);

    const totalEmergencies =
        emergencies.length;

    const pendingEmergencies =
        emergencies.filter(
            (emergency) =>
                emergency.status === "pending"
        ).length;

    const inProgressEmergencies =
        emergencies.filter(
            (emergency) =>
                emergency.status ===
                "in_progress"
        ).length;

    const resolvedEmergencies =
        emergencies.filter(
            (emergency) =>
                emergency.status ===
                "resolved"
        ).length;

    const criticalEmergencies =
        emergencies.filter(
            (emergency) =>
                emergency.severity ===
                "critical"
        ).length;

    const cancelledEmergencies =
        emergencies.filter(
            (emergency) =>
                emergency.status ===
                "cancelled"
        ).length;

    const departmentStats = useMemo(() => {
        return {
            police: emergencies.filter(
                (emergency) =>
                    emergency.department ===
                    "police"
            ).length,

            medical: emergencies.filter(
                (emergency) =>
                    emergency.department ===
                    "medical"
            ).length,

            fire: emergencies.filter(
                (emergency) =>
                    emergency.department ===
                    "fire"
            ).length,

            multi: emergencies.filter(
                (emergency) =>
                    emergency.department ===
                    "multi"
            ).length,

            pending: emergencies.filter(
                (emergency) =>
                    emergency.department ===
                    "pending"
            ).length
        };
    }, [emergencies]);

    const filteredEmergencies =
        emergencies.filter(
            (emergency) => {
                if (filter === "pending") {
                    return (
                        emergency.status ===
                        "pending"
                    );
                }

                if (filter === "in_progress") {
                    return (
                        emergency.status ===
                        "in_progress"
                    );
                }

                if (filter === "resolved") {
                    return (
                        emergency.status ===
                        "resolved"
                    );
                }

                if (filter === "critical") {
                    return (
                        emergency.severity ===
                        "critical"
                    );
                }

                if (filter === "multi") {
                    return (
                        emergency.department ===
                        "multi"
                    );
                }

                return true;
            }
        );

    const handleLogout = () => {
        localStorage.removeItem(
            "adminToken"
        );

        localStorage.removeItem(
            "admin"
        );

        navigate("/admin/login");
    };

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

    const getStatusStyle = (status) => {
        if (status === "pending") {
            return "bg-amber-50 text-amber-700 border-amber-200";
        }

        if (status === "in_progress") {
            return "bg-blue-50 text-blue-700 border-blue-200";
        }

        if (status === "resolved") {
            return "bg-green-50 text-green-700 border-green-200";
        }

        if (status === "cancelled") {
            return "bg-slate-100 text-slate-600 border-slate-200";
        }

        return "bg-slate-100 text-slate-600 border-slate-200";
    };

    const getSeverityStyle = (severity) => {
        if (severity === "critical") {
            return "bg-red-50 text-red-700 border-red-200";
        }

        if (severity === "high") {
            return "bg-orange-50 text-orange-700 border-orange-200";
        }

        if (severity === "medium") {
            return "bg-amber-50 text-amber-700 border-amber-200";
        }

        return "bg-green-50 text-green-700 border-green-200";
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <div className="text-center">

                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-[#12345b]" />

                    <p className="mt-4 font-medium text-slate-600">
                        Loading system dashboard...
                    </p>

                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100">

            <aside className="fixed inset-y-0 left-0 hidden w-64 bg-[#12345b] text-white lg:block">

                <div className="flex h-20 items-center border-b border-white/10 px-6">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e66b22]">
                            <Shield size={22} />
                        </div>

                        <div>

                            <h1 className="text-lg font-bold">
                                QuickAid
                            </h1>

                            <p className="text-xs text-blue-100">
                                System Administration
                            </p>

                        </div>

                    </div>

                </div>

                <nav className="px-4 py-6">

                    <div className="rounded-xl bg-white/10 px-4 py-3">

                        <div className="flex items-center gap-3">

                            <Shield
                                size={20}
                                className="text-orange-300"
                            />

                            <div>

                                <p className="text-sm font-semibold">
                                    Superadmin Dashboard
                                </p>

                                <p className="text-xs text-blue-100">
                                    System Overview
                                </p>

                            </div>

                        </div>

                    </div>

                    <div className="mt-6 space-y-2">

                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-lg bg-white/10 px-4 py-3 text-left text-sm font-medium"
                        >
                            <BarChart3 size={18} />
                            System Overview
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/admin/emergencies"
                                )
                            }
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-blue-100 transition hover:bg-white/10 hover:text-white"
                        >
                            <Siren size={18} />
                            Emergency Management
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/admin/live-map"
                                )
                            }
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-blue-100 transition hover:bg-white/10 hover:text-white"
                        >
                            <MapPin size={18} />
                            Live Map
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/admin/analytics"
                                )
                            }
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-blue-100 transition hover:bg-white/10 hover:text-white"
                        >
                            <BarChart3 size={18} />
                            Analytics
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/admin/response-units"
                                )
                            }
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-blue-100 transition hover:bg-white/10 hover:text-white"
                        >
                            <Users size={18} />
                            Response Units
                        </button>

                    </div>

                </nav>

                <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4">

                    <div className="mb-3 rounded-xl bg-white/10 p-3">

                        <p className="text-sm font-semibold">
                            {admin?.name ||
                                "Superadmin"}
                        </p>

                        <p className="mt-1 text-xs text-blue-100">
                            {admin?.username ||
                                "superadmin"}
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-red-500/20"
                    >
                        <LogOut size={17} />
                        Logout
                    </button>

                </div>

            </aside>

            <div className="min-h-screen lg:ml-64">

                <header className="border-b border-slate-200 bg-white">

                    <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

                        <div>

                            <p className="text-sm font-medium text-slate-500">
                                QuickAid Command Center
                            </p>

                            <h2 className="text-xl font-bold text-[#12345b] sm:text-2xl">
                                System Administration Dashboard
                            </h2>

                        </div>

                        <div className="flex items-center gap-3">

                            <button
                                type="button"
                                onClick={() =>
                                    fetchEmergencies(
                                        false
                                    )
                                }
                                disabled={refreshing}
                                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                            >
                                <RefreshCw
                                    size={17}
                                    className={
                                        refreshing
                                            ? "animate-spin"
                                            : ""
                                    }
                                />

                                <span className="hidden sm:inline">
                                    Refresh
                                </span>
                            </button>

                            <div className="hidden h-9 w-px bg-slate-200 sm:block" />

                            <div className="hidden sm:block">

                                <p className="text-sm font-semibold text-slate-800">
                                    {admin?.name}
                                </p>

                                <p className="text-xs text-slate-500">
                                    System Administrator
                                </p>

                            </div>

                        </div>

                    </div>

                </header>

                <main className="px-4 py-6 sm:px-6 lg:px-8">

                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">

                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">

                            <Activity
                                size={17}
                                className="text-green-600"
                            />

                        </div>

                        <div>

                            <p className="text-sm font-semibold text-green-800">
                                System monitoring active
                            </p>

                            <p className="text-xs text-green-700">
                                Monitoring all emergency departments
                            </p>

                        </div>

                    </div>

                    {error && (
                        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">

                            <div className="flex items-center justify-between gap-4">

                                <div>

                                    <p className="font-semibold text-red-800">
                                        Failed to load system data
                                    </p>

                                    <p className="mt-1 text-sm text-red-600">
                                        {error}
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        fetchEmergencies(
                                            false
                                        )
                                    }
                                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                                >
                                    Retry
                                </button>

                            </div>

                        </div>
                    )}

                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

                        <div className="rounded-2xl bg-white p-5 shadow-sm">

                            <div className="flex items-center justify-between">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">

                                    <Siren
                                        size={22}
                                        className="text-[#12345b]"
                                    />

                                </div>

                                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Total
                                </span>

                            </div>

                            <p className="mt-5 text-3xl font-bold text-slate-800">
                                {totalEmergencies}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                All emergencies
                            </p>

                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm">

                            <div className="flex items-center justify-between">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">

                                    <Clock3
                                        size={22}
                                        className="text-amber-600"
                                    />

                                </div>

                                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Pending
                                </span>

                            </div>

                            <p className="mt-5 text-3xl font-bold text-slate-800">
                                {pendingEmergencies}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Awaiting response
                            </p>

                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm">

                            <div className="flex items-center justify-between">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">

                                    <Activity
                                        size={22}
                                        className="text-blue-600"
                                    />

                                </div>

                                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Active
                                </span>

                            </div>

                            <p className="mt-5 text-3xl font-bold text-slate-800">
                                {inProgressEmergencies}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Responses in progress
                            </p>

                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm">

                            <div className="flex items-center justify-between">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">

                                    <AlertCircle
                                        size={22}
                                        className="text-red-600"
                                    />

                                </div>

                                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Critical
                                </span>

                            </div>

                            <p className="mt-5 text-3xl font-bold text-slate-800">
                                {criticalEmergencies}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Critical emergencies
                            </p>

                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm">

                            <div className="flex items-center justify-between">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">

                                    <CheckCircle2
                                        size={22}
                                        className="text-green-600"
                                    />

                                </div>

                                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Resolved
                                </span>

                            </div>

                            <p className="mt-5 text-3xl font-bold text-slate-800">
                                {resolvedEmergencies}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Completed emergencies
                            </p>

                        </div>

                    </section>

                    <section className="mt-8 grid gap-6 lg:grid-cols-2">

                        <div className="rounded-2xl bg-white p-6 shadow-sm">

                            <div className="flex items-center justify-between">

                                <div>

                                    <h3 className="text-lg font-bold text-[#12345b]">
                                        Department Overview
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Emergency distribution by department
                                    </p>

                                </div>

                                <BarChart3
                                    size={22}
                                    className="text-[#e66b22]"
                                />

                            </div>

                            <div className="mt-6 space-y-4">

                                <div>

                                    <div className="mb-2 flex items-center justify-between">

                                        <div className="flex items-center gap-2">

                                            <Shield
                                                size={17}
                                                className="text-[#12345b]"
                                            />

                                            <span className="text-sm font-semibold text-slate-700">
                                                Police
                                            </span>

                                        </div>

                                        <span className="text-sm font-bold text-slate-800">
                                            {
                                                departmentStats.police
                                            }
                                        </span>

                                    </div>

                                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                                        <div
                                            className="h-full rounded-full bg-[#12345b]"
                                            style={{
                                                width:
                                                    totalEmergencies
                                                        ? `${(
                                                            departmentStats.police /
                                                            totalEmergencies
                                                        ) * 100}%`
                                                        : "0%"
                                            }}
                                        />

                                    </div>

                                </div>

                                <div>

                                    <div className="mb-2 flex items-center justify-between">

                                        <div className="flex items-center gap-2">

                                            <HeartPulse
                                                size={17}
                                                className="text-red-500"
                                            />

                                            <span className="text-sm font-semibold text-slate-700">
                                                Medical
                                            </span>

                                        </div>

                                        <span className="text-sm font-bold text-slate-800">
                                            {
                                                departmentStats.medical
                                            }
                                        </span>

                                    </div>

                                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                                        <div
                                            className="h-full rounded-full bg-red-500"
                                            style={{
                                                width:
                                                    totalEmergencies
                                                        ? `${(
                                                            departmentStats.medical /
                                                            totalEmergencies
                                                        ) * 100}%`
                                                        : "0%"
                                            }}
                                        />

                                    </div>

                                </div>

                                <div>

                                    <div className="mb-2 flex items-center justify-between">

                                        <div className="flex items-center gap-2">

                                            <Flame
                                                size={17}
                                                className="text-[#e66b22]"
                                            />

                                            <span className="text-sm font-semibold text-slate-700">
                                                Fire
                                            </span>

                                        </div>

                                        <span className="text-sm font-bold text-slate-800">
                                            {
                                                departmentStats.fire
                                            }
                                        </span>

                                    </div>

                                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                                        <div
                                            className="h-full rounded-full bg-[#e66b22]"
                                            style={{
                                                width:
                                                    totalEmergencies
                                                        ? `${(
                                                            departmentStats.fire /
                                                            totalEmergencies
                                                        ) * 100}%`
                                                        : "0%"
                                            }}
                                        />

                                    </div>

                                </div>

                                <div>

                                    <div className="mb-2 flex items-center justify-between">

                                        <div className="flex items-center gap-2">

                                            <Siren
                                                size={17}
                                                className="text-purple-600"
                                            />

                                            <span className="text-sm font-semibold text-slate-700">
                                                Multi-Department
                                            </span>

                                        </div>

                                        <span className="text-sm font-bold text-slate-800">
                                            {
                                                departmentStats.multi
                                            }
                                        </span>

                                    </div>

                                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                                        <div
                                            className="h-full rounded-full bg-purple-600"
                                            style={{
                                                width:
                                                    totalEmergencies
                                                        ? `${(
                                                            departmentStats.multi /
                                                            totalEmergencies
                                                        ) * 100}%`
                                                        : "0%"
                                            }}
                                        />

                                    </div>

                                </div>

                                <div>

                                    <div className="mb-2 flex items-center justify-between">

                                        <div className="flex items-center gap-2">

                                            <Clock3
                                                size={17}
                                                className="text-slate-500"
                                            />

                                            <span className="text-sm font-semibold text-slate-700">
                                                Pending Department
                                            </span>

                                        </div>

                                        <span className="text-sm font-bold text-slate-800">
                                            {
                                                departmentStats.pending
                                            }
                                        </span>

                                    </div>

                                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                                        <div
                                            className="h-full rounded-full bg-slate-500"
                                            style={{
                                                width:
                                                    totalEmergencies
                                                        ? `${(
                                                            departmentStats.pending /
                                                            totalEmergencies
                                                        ) * 100}%`
                                                        : "0%"
                                            }}
                                        />

                                    </div>

                                </div>

                            </div>

                        </div>

                        <div className="rounded-2xl bg-[#12345b] p-6 text-white shadow-sm">

                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">

                                    <Shield size={22} />

                                </div>

                                <div>

                                    <h3 className="font-bold">
                                        System Status
                                    </h3>

                                    <p className="text-xs text-blue-100">
                                        QuickAid operational overview
                                    </p>

                                </div>

                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">

                                <div className="rounded-xl bg-white/10 p-4">

                                    <p className="text-sm text-blue-100">
                                        Active Responses
                                    </p>

                                    <p className="mt-2 text-2xl font-bold">
                                        {
                                            inProgressEmergencies
                                        }
                                    </p>

                                </div>

                                <div className="rounded-xl bg-white/10 p-4">

                                    <p className="text-sm text-blue-100">
                                        Critical Cases
                                    </p>

                                    <p className="mt-2 text-2xl font-bold">
                                        {
                                            criticalEmergencies
                                        }
                                    </p>

                                </div>

                                <div className="rounded-xl bg-white/10 p-4">

                                    <p className="text-sm text-blue-100">
                                        Cancelled
                                    </p>

                                    <p className="mt-2 text-2xl font-bold">
                                        {
                                            cancelledEmergencies
                                        }
                                    </p>

                                </div>

                                <div className="rounded-xl bg-white/10 p-4">

                                    <p className="text-sm text-blue-100">
                                        Unassigned
                                    </p>

                                    <p className="mt-2 text-2xl font-bold">
                                        {
                                            departmentStats.pending
                                        }
                                    </p>

                                </div>

                            </div>

                            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">

                                <div className="flex items-center gap-3">

                                    <div className="h-2.5 w-2.5 rounded-full bg-green-400" />

                                    <div>

                                        <p className="text-sm font-semibold">
                                            All department monitoring active
                                        </p>

                                        <p className="mt-1 text-xs text-blue-100">
                                            Police, medical, fire and multi-department emergencies are being monitored.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </section>

                    <section className="mt-8 rounded-2xl bg-white shadow-sm">

                        <div className="border-b border-slate-200 p-6">

                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                                <div>

                                    <h3 className="text-lg font-bold text-[#12345b]">
                                        System Emergency Queue
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        All emergency cases across QuickAid
                                    </p>

                                </div>

                                <div className="flex flex-wrap gap-2">

                                    {[
                                        ["all", "All"],
                                        ["pending", "Pending"],
                                        ["in_progress", "In Progress"],
                                        ["critical", "Critical"],
                                        ["multi", "Multi"],
                                        ["resolved", "Resolved"]
                                    ].map(
                                        ([value, label]) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() =>
                                                    setFilter(
                                                        value
                                                    )
                                                }
                                                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${filter ===
                                                        value
                                                        ? "bg-[#12345b] text-white"
                                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                    }`}
                                            >
                                                {label}
                                            </button>
                                        )
                                    )}

                                </div>

                            </div>

                        </div>

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[1000px]">

                                <thead className="bg-slate-50">

                                    <tr className="border-b border-slate-200">

                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Emergency
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Department
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Type
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Severity
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Status
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Location
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Received
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredEmergencies
                                        .slice(0, 20)
                                        .map(
                                            (emergency) => (
                                                <tr
                                                    key={
                                                        emergency.emergency_id
                                                    }
                                                    className="border-b border-slate-100 transition hover:bg-slate-50"
                                                >

                                                    <td className="px-6 py-4">

                                                        <div>

                                                            <p className="font-semibold text-slate-800">
                                                                {
                                                                    emergency.emergency_id
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-400">
                                                                {
                                                                    emergency.user_name ||
                                                                    "Unknown user"
                                                                }
                                                            </p>

                                                        </div>

                                                    </td>

                                                    <td className="px-6 py-4">

                                                        <span className="font-medium capitalize text-slate-700">
                                                            {
                                                                emergency.department ||
                                                                "pending"
                                                            }
                                                        </span>

                                                    </td>

                                                    <td className="px-6 py-4">

                                                        <span className="font-medium capitalize text-slate-700">
                                                            {
                                                                emergency.emergency_type ||
                                                                "other"
                                                            }
                                                        </span>

                                                    </td>

                                                    <td className="px-6 py-4">

                                                        <span
                                                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getSeverityStyle(
                                                                emergency.severity
                                                            )}`}
                                                        >
                                                            {
                                                                emergency.severity
                                                            }
                                                        </span>

                                                    </td>

                                                    <td className="px-6 py-4">

                                                        <span
                                                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                                                                emergency.status
                                                            )}`}
                                                        >
                                                            {emergency.status?.replace(
                                                                "_",
                                                                " "
                                                            )}
                                                        </span>

                                                    </td>

                                                    <td className="px-6 py-4">

                                                        <div className="flex items-center gap-2 text-sm text-slate-600">

                                                            <MapPin
                                                                size={16}
                                                                className="text-[#e66b22]"
                                                            />

                                                            <span className="max-w-[180px] truncate">
                                                                {
                                                                    emergency.address ||
                                                                    "Location available"
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>

                                                    <td className="px-6 py-4 text-sm text-slate-500">
                                                        {formatDate(
                                                            emergency.created_at
                                                        )}
                                                    </td>

                                                </tr>
                                            )
                                        )}

                                </tbody>

                            </table>

                            {filteredEmergencies.length ===
                                0 && (
                                    <div className="px-6 py-12 text-center">

                                        <Shield
                                            size={36}
                                            className="mx-auto text-slate-300"
                                        />

                                        <p className="mt-3 font-semibold text-slate-600">
                                            No emergencies found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            No cases match the selected filter.
                                        </p>

                                    </div>
                                )}

                        </div>

                    </section>

                </main>

            </div>

        </div>
    );
}

export default SuperadminDashboard;