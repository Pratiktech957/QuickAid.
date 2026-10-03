import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AlertTriangle,
    Bell,
    CheckCircle2,
    Clock3,
    MapPin,
    Menu,
    RefreshCw,
    Shield,
    Siren,
    XCircle
} from "lucide-react";

import {
    getAllEmergencies
} from "../../../api/emergency.api";

function PoliceDashboard() {
    const navigate = useNavigate();

    const [admin, setAdmin] = useState(null);

    const [emergencies, setEmergencies] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [filter, setFilter] =
        useState("all");

    const [sidebarOpen, setSidebarOpen] =
        useState(false);

    useEffect(() => {
        const storedAdmin =
            localStorage.getItem("admin");

        const token =
            localStorage.getItem("adminToken");

        if (!storedAdmin || !token) {
            navigate("/admin/login");
            return;
        }

        setAdmin(
            JSON.parse(storedAdmin)
        );
    }, [navigate]);

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
                "Police dashboard error:",
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
                "Failed to load police emergencies."
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
        fetchEmergencies(true);
    }, []);

    const statistics = useMemo(() => {
        return {
            total: emergencies.length,

            pending: emergencies.filter(
                (emergency) =>
                    emergency.status === "pending"
            ).length,

            inProgress: emergencies.filter(
                (emergency) =>
                    emergency.status === "in_progress"
            ).length,

            resolved: emergencies.filter(
                (emergency) =>
                    emergency.status === "resolved"
            ).length,

            critical: emergencies.filter(
                (emergency) =>
                    emergency.severity === "critical"
            ).length
        };
    }, [emergencies]);

    const criticalEmergencies =
        emergencies.filter(
            (emergency) =>
                emergency.severity === "critical"
        );

    const multiEmergencies =
        emergencies.filter(
            (emergency) =>
                emergency.department === "multi"
        );

    const filteredEmergencies =
        filter === "all"
            ? emergencies
            : emergencies.filter(
                (emergency) =>
                    emergency.status === filter
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

    const getSeverityClass = (severity) => {
        switch (severity) {
            case "critical":
                return "bg-red-50 text-red-700 border-red-200";

            case "high":
                return "bg-orange-50 text-orange-700 border-orange-200";

            case "medium":
                return "bg-yellow-50 text-yellow-700 border-yellow-200";

            default:
                return "bg-green-50 text-green-700 border-green-200";
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "pending":
                return "bg-yellow-50 text-yellow-700 border-yellow-200";

            case "in_progress":
                return "bg-blue-50 text-blue-700 border-blue-200";

            case "resolved":
                return "bg-green-50 text-green-700 border-green-200";

            case "cancelled":
                return "bg-slate-100 text-slate-600 border-slate-200";

            default:
                return "bg-slate-100 text-slate-600 border-slate-200";
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-[#e66b22]" />

                    <p className="mt-4 font-medium text-[#12345b]">
                        Loading Police Dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100">

            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-[#12345b] transition-transform duration-300 lg:translate-x-0 ${sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                    }`}
            >
                <div className="flex h-full flex-col">

                    <div className="border-b border-white/10 px-6 py-6">

                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white">

                                <Shield
                                    size={25}
                                    className="text-[#12345b]"
                                />

                            </div>

                            <div>
                                <h1 className="text-xl font-bold text-white">
                                    Quick
                                    <span className="text-[#e66b22]">
                                        Aid
                                    </span>
                                </h1>

                                <p className="text-xs text-slate-300">
                                    Police Response
                                </p>
                            </div>

                        </div>

                    </div>

                    <div className="px-4 py-6">

                        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Police Control
                        </p>

                        <div className="rounded-lg bg-white/10 px-4 py-3 text-sm font-medium text-white">
                            Emergency Dashboard
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/admin/emergencies"
                                )
                            }
                            className="mt-2 w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                        >
                            Emergency Management
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/admin/live-map"
                                )
                            }
                            className="mt-2 w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                        >
                            Live Map
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/admin/analytics"
                                )
                            }
                            className="mt-2 w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                        >
                            Analytics
                        </button>

                    </div>

                    <div className="mt-auto border-t border-white/10 p-4">

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full rounded-lg bg-[#e66b22] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#cf5e1d]"
                        >
                            Logout
                        </button>

                    </div>

                </div>
            </aside>

            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                />
            )}

            <div className="min-h-screen lg:ml-64">

                <header className="border-b border-slate-200 bg-white">

                    <div className="flex min-h-[82px] items-center justify-between px-4 sm:px-6 lg:px-8">

                        <div className="flex items-center gap-4">

                            <button
                                type="button"
                                onClick={() =>
                                    setSidebarOpen(true)
                                }
                                className="rounded-lg border border-slate-200 p-2 text-[#12345b] lg:hidden"
                            >
                                <Menu size={22} />
                            </button>

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wider text-[#e66b22]">
                                    Police Department
                                </p>

                                <h2 className="text-xl font-bold text-[#12345b] sm:text-2xl">
                                    Emergency Response Dashboard
                                </h2>

                            </div>

                        </div>

                        <div className="hidden items-center gap-4 sm:flex">

                            <div className="text-right">

                                <p className="text-sm font-semibold text-[#12345b]">
                                    {admin?.name ||
                                        "Police Administrator"}
                                </p>

                                <p className="text-xs capitalize text-slate-500">
                                    {admin?.department ||
                                        "police"}{" "}
                                    control
                                </p>

                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#12345b] text-sm font-bold text-white">
                                {admin?.name
                                    ?.charAt(0)
                                    ?.toUpperCase() ||
                                    "P"}
                            </div>

                        </div>

                    </div>

                    <div className="h-1 bg-[#e66b22]" />

                </header>

                <main className="px-4 py-6 sm:px-6 lg:px-8">

                    <div className="mb-6 flex flex-col gap-4 rounded-xl border border-green-200 bg-green-50 p-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                <Bell
                                    size={20}
                                    className="text-green-600"
                                />
                            </div>

                            <div>
                                <p className="font-semibold text-green-800">
                                    Police emergency monitoring active
                                </p>

                                <p className="text-sm text-green-700">
                                    Monitoring police and multi-department emergencies
                                </p>
                            </div>

                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                fetchEmergencies(false)
                            }
                            disabled={refreshing}
                            className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#12345b] shadow-sm ring-1 ring-green-200 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <RefreshCw
                                size={16}
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

                    {error && (
                        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">

                            <div className="flex items-center gap-3">

                                <XCircle
                                    size={22}
                                    className="text-red-600"
                                />

                                <div>
                                    <p className="font-semibold text-red-800">
                                        Unable to load emergencies
                                    </p>

                                    <p className="text-sm text-red-600">
                                        {error}
                                    </p>
                                </div>

                            </div>

                        </div>
                    )}

                    <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

                        <div className="rounded-xl border border-slate-200 border-l-4 border-l-[#12345b] bg-white p-5 shadow-sm">

                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Total Cases
                                    </p>

                                    <p className="mt-2 text-3xl font-bold text-[#12345b]">
                                        {statistics.total}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-blue-50 p-3">
                                    <Siren
                                        size={23}
                                        className="text-[#12345b]"
                                    />
                                </div>

                            </div>

                        </div>

                        <div className="rounded-xl border border-slate-200 border-l-4 border-l-[#e66b22] bg-white p-5 shadow-sm">

                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Pending
                                    </p>

                                    <p className="mt-2 text-3xl font-bold text-[#12345b]">
                                        {statistics.pending}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-orange-50 p-3">
                                    <Clock3
                                        size={23}
                                        className="text-[#e66b22]"
                                    />
                                </div>

                            </div>

                        </div>

                        <div className="rounded-xl border border-slate-200 border-l-4 border-l-blue-600 bg-white p-5 shadow-sm">

                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        In Progress
                                    </p>

                                    <p className="mt-2 text-3xl font-bold text-[#12345b]">
                                        {statistics.inProgress}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-blue-50 p-3">
                                    <RefreshCw
                                        size={23}
                                        className="text-blue-600"
                                    />
                                </div>

                            </div>

                        </div>

                        <div className="rounded-xl border border-slate-200 border-l-4 border-l-green-500 bg-white p-5 shadow-sm">

                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Resolved
                                    </p>

                                    <p className="mt-2 text-3xl font-bold text-[#12345b]">
                                        {statistics.resolved}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-green-50 p-3">
                                    <CheckCircle2
                                        size={23}
                                        className="text-green-600"
                                    />
                                </div>

                            </div>

                        </div>

                        <div className="rounded-xl border border-slate-200 border-l-4 border-l-red-500 bg-white p-5 shadow-sm">

                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Critical
                                    </p>

                                    <p className="mt-2 text-3xl font-bold text-red-600">
                                        {statistics.critical}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-red-50 p-3">
                                    <AlertTriangle
                                        size={23}
                                        className="text-red-600"
                                    />
                                </div>

                            </div>

                        </div>

                    </div>

                    <div className="mb-8 grid gap-6 xl:grid-cols-2">

                        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-200 p-5">

                                <div className="flex items-center justify-between">

                                    <div>
                                        <h3 className="text-lg font-bold text-[#12345b]">
                                            Critical Incidents
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Immediate police attention required
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-red-50 p-3">
                                        <AlertTriangle
                                            size={22}
                                            className="text-red-600"
                                        />
                                    </div>

                                </div>

                            </div>

                            <div className="max-h-[420px] overflow-y-auto">

                                {criticalEmergencies.length === 0 ? (
                                    <div className="p-8 text-center">

                                        <CheckCircle2
                                            size={36}
                                            className="mx-auto text-green-500"
                                        />

                                        <p className="mt-3 font-semibold text-[#12345b]">
                                            No critical incidents
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                            No critical police cases are currently active.
                                        </p>

                                    </div>
                                ) : (
                                    criticalEmergencies
                                        .slice(0, 6)
                                        .map(
                                            (
                                                emergency
                                            ) => (
                                                <div
                                                    key={
                                                        emergency.emergency_id
                                                    }
                                                    className="border-b border-slate-100 p-5 last:border-b-0"
                                                >

                                                    <div className="flex items-start justify-between gap-4">

                                                        <div>
                                                            <p className="font-semibold text-[#12345b]">
                                                                {
                                                                    emergency.emergency_id
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-sm capitalize text-slate-600">
                                                                {
                                                                    emergency.emergency_type
                                                                }
                                                            </p>
                                                        </div>

                                                        <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase text-red-700">
                                                            Critical
                                                        </span>

                                                    </div>

                                                    <div className="mt-3 flex items-start gap-2 text-sm text-slate-500">

                                                        <MapPin
                                                            size={16}
                                                            className="mt-0.5 shrink-0 text-[#e66b22]"
                                                        />

                                                        <span>
                                                            {emergency.address ||
                                                                "Location available through emergency details"}
                                                        </span>

                                                    </div>

                                                </div>
                                            )
                                        )
                                )}

                            </div>

                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-200 p-5">

                                <div className="flex items-center justify-between">

                                    <div>
                                        <h3 className="text-lg font-bold text-[#12345b]">
                                            Multi-Department Cases
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Emergencies requiring multiple response departments
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-orange-50 p-3">
                                        <Shield
                                            size={22}
                                            className="text-[#e66b22]"
                                        />
                                    </div>

                                </div>

                            </div>

                            <div className="max-h-[420px] overflow-y-auto">

                                {multiEmergencies.length === 0 ? (
                                    <div className="p-8 text-center">

                                        <Shield
                                            size={36}
                                            className="mx-auto text-slate-400"
                                        />

                                        <p className="mt-3 font-semibold text-[#12345b]">
                                            No multi-department cases
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                            No joint response incidents are currently assigned.
                                        </p>

                                    </div>
                                ) : (
                                    multiEmergencies
                                        .slice(0, 6)
                                        .map(
                                            (
                                                emergency
                                            ) => (
                                                <div
                                                    key={
                                                        emergency.emergency_id
                                                    }
                                                    className="border-b border-slate-100 p-5 last:border-b-0"
                                                >

                                                    <div className="flex items-start justify-between gap-4">

                                                        <div>
                                                            <p className="font-semibold text-[#12345b]">
                                                                {
                                                                    emergency.emergency_id
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-sm capitalize text-slate-600">
                                                                {
                                                                    emergency.emergency_type
                                                                }
                                                            </p>
                                                        </div>

                                                        <span
                                                            className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getSeverityClass(
                                                                emergency.severity
                                                            )}`}
                                                        >
                                                            {
                                                                emergency.severity
                                                            }
                                                        </span>

                                                    </div>

                                                    <div className="mt-3 flex items-start gap-2 text-sm text-slate-500">

                                                        <MapPin
                                                            size={16}
                                                            className="mt-0.5 shrink-0 text-[#e66b22]"
                                                        />

                                                        <span>
                                                            {emergency.address ||
                                                                "Location available through emergency details"}
                                                        </span>

                                                    </div>

                                                </div>
                                            )
                                        )
                                )}

                            </div>

                        </section>

                    </div>

                    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="border-b border-slate-200 p-5">

                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                                <div>
                                    <h3 className="text-lg font-bold text-[#12345b]">
                                        Police Emergency Queue
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Current police and multi-department emergency cases
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">

                                    {[
                                        {
                                            label: "All",
                                            value: "all"
                                        },
                                        {
                                            label: "Pending",
                                            value: "pending"
                                        },
                                        {
                                            label: "In Progress",
                                            value: "in_progress"
                                        },
                                        {
                                            label: "Resolved",
                                            value: "resolved"
                                        }
                                    ].map(
                                        (item) => (
                                            <button
                                                key={
                                                    item.value
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setFilter(
                                                        item.value
                                                    )
                                                }
                                                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${filter ===
                                                        item.value
                                                        ? "bg-[#12345b] text-white"
                                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                    }`}
                                            >
                                                {
                                                    item.label
                                                }
                                            </button>
                                        )
                                    )}

                                </div>

                            </div>

                        </div>

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[850px]">

                                <thead className="bg-slate-50">

                                    <tr>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Emergency
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Type
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Severity
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Department
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Status
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Created
                                        </th>

                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-slate-100">

                                    {filteredEmergencies.length === 0 ? (
                                        <tr>

                                            <td
                                                colSpan="6"
                                                className="px-5 py-12 text-center"
                                            >

                                                <Siren
                                                    size={36}
                                                    className="mx-auto text-slate-300"
                                                />

                                                <p className="mt-3 font-semibold text-[#12345b]">
                                                    No emergencies found
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    There are no cases matching this filter.
                                                </p>

                                            </td>

                                        </tr>
                                    ) : (
                                        filteredEmergencies
                                            .slice(0, 20)
                                            .map(
                                                (
                                                    emergency
                                                ) => (
                                                    <tr
                                                        key={
                                                            emergency.emergency_id
                                                        }
                                                        className="transition hover:bg-slate-50"
                                                    >

                                                        <td className="px-5 py-4">

                                                            <p className="font-semibold text-[#12345b]">
                                                                {
                                                                    emergency.emergency_id
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-500">
                                                                {emergency.user_name ||
                                                                    "Unknown caller"}
                                                            </p>

                                                        </td>

                                                        <td className="px-5 py-4">

                                                            <span className="text-sm capitalize text-slate-700">
                                                                {
                                                                    emergency.emergency_type
                                                                }
                                                            </span>

                                                        </td>

                                                        <td className="px-5 py-4">

                                                            <span
                                                                className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getSeverityClass(
                                                                    emergency.severity
                                                                )}`}
                                                            >
                                                                {
                                                                    emergency.severity
                                                                }
                                                            </span>

                                                        </td>

                                                        <td className="px-5 py-4">

                                                            <span className="text-sm font-medium capitalize text-slate-700">
                                                                {
                                                                    emergency.department
                                                                }
                                                            </span>

                                                        </td>

                                                        <td className="px-5 py-4">

                                                            <span
                                                                className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                                                                    emergency.status
                                                                )}`}
                                                            >
                                                                {emergency.status?.replace(
                                                                    "_",
                                                                    " "
                                                                )}
                                                            </span>

                                                        </td>

                                                        <td className="px-5 py-4">

                                                            <span className="text-sm text-slate-500">
                                                                {formatDate(
                                                                    emergency.created_at
                                                                )}
                                                            </span>

                                                        </td>

                                                    </tr>
                                                )
                                            )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </section>

                </main>

            </div>

        </div>
    );
}

export default PoliceDashboard;