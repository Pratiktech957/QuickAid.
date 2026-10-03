import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Activity,
    AlertCircle,
    CheckCircle2,
    Clock3,
    HeartPulse,
    LogOut,
    MapPin,
    RefreshCw,
    Siren,
    Stethoscope
} from "lucide-react";

import {
    getAllEmergencies
} from "../../../api/emergency.api";

function MedicalDashboard() {
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
                "Medical dashboard error:",
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
                "Failed to load medical emergencies."
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

    const medicalEmergencies =
        useMemo(() => {
            return emergencies.filter(
                (emergency) =>
                    emergency.department ===
                    "medical" ||
                    emergency.department ===
                    "multi"
            );
        }, [emergencies]);

    const totalCases =
        medicalEmergencies.length;

    const pendingCases =
        medicalEmergencies.filter(
            (emergency) =>
                emergency.status ===
                "pending"
        ).length;

    const inProgressCases =
        medicalEmergencies.filter(
            (emergency) =>
                emergency.status ===
                "in_progress"
        ).length;

    const resolvedCases =
        medicalEmergencies.filter(
            (emergency) =>
                emergency.status ===
                "resolved"
        ).length;

    const criticalCases =
        medicalEmergencies.filter(
            (emergency) =>
                emergency.severity ===
                "critical"
        ).length;

    const multiDepartmentCases =
        medicalEmergencies.filter(
            (emergency) =>
                emergency.department ===
                "multi"
        ).length;

    const filteredEmergencies =
        medicalEmergencies.filter(
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
                        Loading medical dashboard...
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
                            <HeartPulse
                                size={22}
                            />
                        </div>

                        <div>
                            <h1 className="text-lg font-bold">
                                QuickAid
                            </h1>

                            <p className="text-xs text-blue-100">
                                Medical Response
                            </p>
                        </div>
                    </div>
                </div>

                <nav className="px-4 py-6">

                    <div className="rounded-xl bg-white/10 px-4 py-3">
                        <div className="flex items-center gap-3">
                            <Activity
                                size={20}
                                className="text-orange-300"
                            />

                            <div>
                                <p className="text-sm font-semibold">
                                    Medical Dashboard
                                </p>

                                <p className="text-xs text-blue-100">
                                    Emergency Operations
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 space-y-2">

                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-lg bg-white/10 px-4 py-3 text-left text-sm font-medium"
                        >
                            <Stethoscope
                                size={18}
                            />
                            Medical Emergencies
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
                            <Siren
                                size={18}
                            />
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
                            <MapPin
                                size={18}
                            />
                            Live Map
                        </button>

                    </div>

                </nav>

                <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4">

                    <div className="mb-3 rounded-xl bg-white/10 p-3">
                        <p className="text-sm font-semibold">
                            {admin?.name ||
                                "Medical Admin"}
                        </p>

                        <p className="mt-1 text-xs text-blue-100">
                            {admin?.username ||
                                "medical"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-red-500/20"
                    >
                        <LogOut
                            size={17}
                        />
                        Logout
                    </button>

                </div>

            </aside>

            <div className="min-h-screen lg:ml-64">

                <header className="border-b border-slate-200 bg-white">

                    <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Medical Response Center
                            </p>

                            <h2 className="text-xl font-bold text-[#12345b] sm:text-2xl">
                                Medical Emergency Dashboard
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
                                    Medical Administrator
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
                                Medical emergency monitoring active
                            </p>

                            <p className="text-xs text-green-700">
                                Monitoring medical and multi-department cases
                            </p>
                        </div>

                    </div>

                    {error && (
                        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">

                            <div className="flex items-center justify-between gap-4">

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
                                    <Stethoscope
                                        size={22}
                                        className="text-[#12345b]"
                                    />
                                </div>

                                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Total
                                </span>
                            </div>

                            <p className="mt-5 text-3xl font-bold text-slate-800">
                                {totalCases}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Medical cases
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
                                {pendingCases}
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
                                {inProgressCases}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Response in progress
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
                                {criticalCases}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Critical patients
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
                                {resolvedCases}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Completed cases
                            </p>
                        </div>

                    </section>

                    <section className="mt-8 grid gap-6 xl:grid-cols-3">

                        <div className="rounded-2xl bg-white p-6 shadow-sm xl:col-span-2">

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                <div>
                                    <h3 className="text-lg font-bold text-[#12345b]">
                                        Critical Medical Cases
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Cases requiring immediate medical attention
                                    </p>
                                </div>

                                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                                    {criticalCases} Critical
                                </span>

                            </div>

                            <div className="mt-5 space-y-3">

                                {medicalEmergencies
                                    .filter(
                                        (emergency) =>
                                            emergency.severity ===
                                            "critical"
                                    )
                                    .slice(0, 5)
                                    .map(
                                        (emergency) => (
                                            <div
                                                key={
                                                    emergency.emergency_id
                                                }
                                                className="rounded-xl border border-red-100 bg-red-50/40 p-4"
                                            >

                                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2">

                                                            <span className="font-bold text-slate-800">
                                                                {
                                                                    emergency.emergency_id
                                                                }
                                                            </span>

                                                            <span
                                                                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                                                                    emergency.status
                                                                )}`}
                                                            >
                                                                {emergency.status?.replace(
                                                                    "_",
                                                                    " "
                                                                )}
                                                            </span>

                                                        </div>

                                                        <p className="mt-2 text-sm font-medium text-slate-700">
                                                            {
                                                                emergency.emergency_type
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-sm text-slate-500">
                                                            {
                                                                emergency.description ||
                                                                "No description provided"
                                                            }
                                                        </p>
                                                    </div>

                                                    <div className="text-left md:text-right">
                                                        <p className="text-xs text-slate-400">
                                                            Received
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-slate-700">
                                                            {formatDate(
                                                                emergency.created_at
                                                            )}
                                                        </p>
                                                    </div>

                                                </div>

                                            </div>
                                        )
                                    )}

                                {criticalCases === 0 && (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">

                                        <CheckCircle2
                                            size={32}
                                            className="mx-auto text-green-500"
                                        />

                                        <p className="mt-3 font-semibold text-slate-700">
                                            No critical cases
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                            There are currently no critical medical emergencies.
                                        </p>

                                    </div>
                                )}

                            </div>

                        </div>

                        <div className="rounded-2xl bg-[#12345b] p-6 text-white shadow-sm">

                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                                    <HeartPulse
                                        size={22}
                                    />
                                </div>

                                <div>
                                    <h3 className="font-bold">
                                        Medical Response
                                    </h3>

                                    <p className="text-xs text-blue-100">
                                        Current operational overview
                                    </p>
                                </div>

                            </div>

                            <div className="mt-6 space-y-4">

                                <div className="rounded-xl bg-white/10 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-blue-100">
                                            Active Cases
                                        </span>

                                        <span className="text-xl font-bold">
                                            {inProgressCases}
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-xl bg-white/10 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-blue-100">
                                            Multi-Department
                                        </span>

                                        <span className="text-xl font-bold">
                                            {multiDepartmentCases}
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-xl bg-white/10 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-blue-100">
                                            Resolved
                                        </span>

                                        <span className="text-xl font-bold">
                                            {resolvedCases}
                                        </span>
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
                                        Medical Emergency Queue
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Medical and multi-department emergency cases
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">

                                    {[
                                        ["all", "All"],
                                        ["pending", "Pending"],
                                        ["in_progress", "In Progress"],
                                        ["critical", "Critical"],
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

                            <table className="w-full min-w-[900px]">

                                <thead className="bg-slate-50">

                                    <tr className="border-b border-slate-200">

                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Emergency
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
                                        .slice(0, 15)
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
                                                                emergency.emergency_type ||
                                                                "Other"
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

                                        <HeartPulse
                                            size={36}
                                            className="mx-auto text-slate-300"
                                        />

                                        <p className="mt-3 font-semibold text-slate-600">
                                            No medical emergencies found
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

export default MedicalDashboard;