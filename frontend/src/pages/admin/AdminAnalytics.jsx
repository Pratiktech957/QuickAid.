import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Activity,
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    Clock3,
    RefreshCw,
    Siren,
    TrendingUp,
    ShieldAlert,
    Flame,
    Car
} from "lucide-react";

import {
    getDashboardStats,
    getEmergencyAnalytics
} from "../../api/analytics.api";

import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";

function AdminAnalytics() {

    const navigate = useNavigate();

    const admin = JSON.parse(
        localStorage.getItem("admin") || "null"
    );

    // ==========================================
    // STATE
    // ==========================================

    const [analytics, setAnalytics] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [sidebarOpen, setSidebarOpen] =
        useState(false);


    // ==========================================
    // FETCH ANALYTICS
    // ==========================================

    const fetchAnalytics = async (
        initialLoad = false
    ) => {

        try {

            if (initialLoad) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");

            const [
                statsResponse,
                analyticsResponse
            ] = await Promise.all([
                getDashboardStats(),
                getEmergencyAnalytics()
            ]);

            setAnalytics({
                stats: statsResponse.data,
                ...analyticsResponse.data
            });

        } catch (error) {

            console.error(
                "Analytics fetch error:",
                error
            );

            const message =
                error.message?.toLowerCase() || "";

            if (
                message.includes("token") ||
                message.includes("unauthorized") ||
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
                error.message ||
                "Failed to load analytics."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    };


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {

        fetchAnalytics(true);

    }, []);


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
    // DATA
    // ==========================================

    const stats =
        analytics?.stats || {};

    const byType =
        analytics?.byType || [];

    const byStatus =
        analytics?.byStatus || [];

    const byHour =
        analytics?.byHour || [];


    // ==========================================
    // SUMMARY
    // ==========================================

    const totalEmergencies =
        stats.total || 0;

    const pendingCount =
        stats.pending || 0;

    const inProgressCount =
        stats.inProgress || 0;

    const resolvedCount =
        stats.resolved || 0;

    const activeCount =
        pendingCount +
        inProgressCount;


    // ==========================================
    // TYPE DATA
    // ==========================================

    const typeTotal =
        byType.reduce(
            (total, item) =>
                total + (item.count || 0),
            0
        );

    const typeData = useMemo(() => {

        return byType
            .map((item) => ({
                name:
                    item._id ||
                    "Unknown",
                count:
                    item.count || 0
            }))
            .sort(
                (a, b) =>
                    b.count - a.count
            );

    }, [byType]);


    // ==========================================
    // STATUS DATA
    // ==========================================

    const statusData = [
        {
            name: "Pending",
            value: pendingCount,
            icon: Clock3,
            bg: "bg-amber-100",
            text: "text-amber-600",
            bar: "bg-amber-500"
        },
        {
            name: "In Progress",
            value: inProgressCount,
            icon: Activity,
            bg: "bg-blue-100",
            text: "text-blue-600",
            bar: "bg-blue-500"
        },
        {
            name: "Resolved",
            value: resolvedCount,
            icon: CheckCircle2,
            bg: "bg-emerald-100",
            text: "text-emerald-600",
            bar: "bg-emerald-500"
        }
    ];


    // ==========================================
    // RESOLUTION RATE
    // ==========================================

    const resolutionRate =
        totalEmergencies > 0
            ? Math.round(
                (resolvedCount /
                    totalEmergencies) *
                100
            )
            : 0;


    // ==========================================
    // PEAK HOUR
    // ==========================================

    const peakHour = useMemo(() => {

        if (!byHour.length) {
            return null;
        }

        return byHour.reduce(
            (highest, current) =>
                current.count >
                    highest.count
                    ? current
                    : highest
        );

    }, [byHour]);


    // ==========================================
    // HOURLY GRAPH DATA
    // ==========================================

    const hourlyData = useMemo(() => {

        const completeHours =
            Array.from(
                { length: 24 },
                (_, hour) => {

                    const found =
                        byHour.find(
                            (item) =>
                                Number(item._id) ===
                                hour
                        );

                    return {
                        hour,
                        count:
                            found?.count || 0
                    };
                }
            );

        return completeHours;

    }, [byHour]);


    const maxHourlyCount =
        Math.max(
            ...hourlyData.map(
                (item) => item.count
            ),
            1
        );


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">

                <div className="text-center">

                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />

                    <p className="mt-4 text-sm font-medium text-slate-600">
                        Loading analytics...
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
                MAIN
            ================================== */}

            <div className="min-h-screen lg:ml-64">

                {/* HEADER */}

                <AdminHeader
                    admin={admin}
                    onRefresh={() =>
                        fetchAnalytics(false)
                    }
                    onLogout={handleLogout}
                />


                <main className="px-4 py-6 sm:px-6 lg:px-8">

                    {/* ==================================
                        PAGE HEADER
                    ================================== */}

                    <section className="mb-7">

                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

                            <div>

                                <div className="mb-2 flex items-center gap-2">

                                    <BarChart3
                                        size={18}
                                        className="text-indigo-600"
                                    />

                                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                                        QuickAid Analytics
                                    </span>

                                </div>

                                <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                                    Emergency Command Center
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                    Real-time operational overview of
                                    emergency activity and response status.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    fetchAnalytics(false)
                                }
                                disabled={refreshing}
                                className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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
                                    : "Refresh Data"}

                            </button>

                        </div>

                    </section>


                    {/* ==================================
                        ERROR
                    ================================== */}

                    {error && (

                        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">

                            <div className="flex items-start gap-3">

                                <AlertTriangle
                                    size={20}
                                    className="mt-0.5 shrink-0 text-red-600"
                                />

                                <div>

                                    <p className="font-semibold text-red-900">
                                        Analytics unavailable
                                    </p>

                                    <p className="mt-1 text-sm text-red-700">
                                        {error}
                                    </p>

                                </div>

                            </div>

                        </div>
                    )}


                    {/* ==================================
                        KPI CARDS
                    ================================== */}

                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        {/* TOTAL */}

                        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-indigo-50" />

                            <div className="relative">

                                <div className="flex items-center justify-between">

                                    <p className="text-sm font-medium text-slate-500">
                                        Total Emergencies
                                    </p>

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">

                                        <Siren size={19} />

                                    </div>

                                </div>

                                <p className="mt-4 text-3xl font-bold text-slate-950">
                                    {totalEmergencies}
                                </p>

                                <p className="mt-2 text-xs text-slate-400">
                                    All reported incidents
                                </p>

                            </div>

                        </div>


                        {/* ACTIVE */}

                        <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">

                            <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-amber-50" />

                            <div className="relative">

                                <div className="flex items-center justify-between">

                                    <p className="text-sm font-medium text-slate-500">
                                        Active
                                    </p>

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">

                                        <AlertTriangle size={19} />

                                    </div>

                                </div>

                                <p className="mt-4 text-3xl font-bold text-slate-950">
                                    {activeCount}
                                </p>

                                <p className="mt-2 text-xs text-slate-400">
                                    {pendingCount} pending
                                    {" • "}
                                    {inProgressCount} in progress
                                </p>

                            </div>

                        </div>


                        {/* RESOLVED */}

                        <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">

                            <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-emerald-50" />

                            <div className="relative">

                                <div className="flex items-center justify-between">

                                    <p className="text-sm font-medium text-slate-500">
                                        Resolved
                                    </p>

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">

                                        <CheckCircle2 size={19} />

                                    </div>

                                </div>

                                <p className="mt-4 text-3xl font-bold text-slate-950">
                                    {resolvedCount}
                                </p>

                                <p className="mt-2 text-xs text-slate-400">
                                    {resolutionRate}% resolution rate
                                </p>

                            </div>

                        </div>


                        {/* PEAK */}

                        <div className="relative overflow-hidden rounded-2xl border border-violet-200 bg-white p-5 shadow-sm">

                            <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-violet-50" />

                            <div className="relative">

                                <div className="flex items-center justify-between">

                                    <p className="text-sm font-medium text-slate-500">
                                        Peak Hour
                                    </p>

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">

                                        <TrendingUp size={19} />

                                    </div>

                                </div>

                                <p className="mt-4 text-3xl font-bold text-slate-950">

                                    {peakHour
                                        ? `${String(
                                            peakHour._id
                                        ).padStart(
                                            2,
                                            "0"
                                        )}:00`
                                        : "--"}

                                </p>

                                <p className="mt-2 text-xs text-slate-400">

                                    {peakHour
                                        ? `${peakHour.count} reports`
                                        : "No hourly data"}

                                </p>

                            </div>

                        </div>

                    </section>


                    {/* ==================================
                        CHART ROW
                    ================================== */}

                    <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">


                        {/* ==================================
                            EMERGENCY TYPE DONUT
                        ================================== */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                            <div className="flex items-start justify-between">

                                <div>

                                    <h2 className="text-lg font-bold text-slate-950">
                                        Emergency Types
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Incident distribution
                                    </p>

                                </div>

                                <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">

                                    <ShieldAlert size={18} />

                                </div>

                            </div>


                            {typeData.length === 0 ? (

                                <div className="flex min-h-[310px] items-center justify-center text-sm text-slate-400">
                                    No emergency type data.
                                </div>

                            ) : (

                                <>

                                    {/* DONUT */}

                                    <div className="mt-7 flex justify-center">

                                        <div
                                            className="relative flex h-48 w-48 items-center justify-center rounded-full"
                                            style={{
                                                background:
                                                    "conic-gradient(#6366f1 0deg 130deg, #22c55e 130deg 220deg, #f59e0b 220deg 285deg, #ef4444 285deg 335deg, #06b6d4 335deg 360deg)"
                                            }}
                                        >

                                            <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white shadow-inner">

                                                <span className="text-3xl font-bold text-slate-950">
                                                    {typeTotal}
                                                </span>

                                                <span className="text-xs text-slate-400">
                                                    incidents
                                                </span>

                                            </div>

                                        </div>

                                    </div>


                                    {/* LEGEND */}

                                    <div className="mt-7 space-y-3">

                                        {typeData
                                            .slice(0, 5)
                                            .map(
                                                (
                                                    item,
                                                    index
                                                ) => {

                                                    const percentage =
                                                        typeTotal
                                                            ? Math.round(
                                                                (
                                                                    item.count /
                                                                    typeTotal
                                                                ) *
                                                                100
                                                            )
                                                            : 0;

                                                    const iconList = [
                                                        ShieldAlert,
                                                        Car,
                                                        Flame,
                                                        Siren,
                                                        Activity
                                                    ];

                                                    const Icon =
                                                        iconList[
                                                        index
                                                        ] ||
                                                        Activity;

                                                    return (

                                                        <div
                                                            key={
                                                                item.name
                                                            }
                                                            className="flex items-center justify-between"
                                                        >

                                                            <div className="flex min-w-0 items-center gap-3">

                                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">

                                                                    <Icon
                                                                        size={15}
                                                                        className="text-slate-600"
                                                                    />

                                                                </div>

                                                                <span className="truncate text-sm capitalize text-slate-600">
                                                                    {
                                                                        item.name
                                                                    }
                                                                </span>

                                                            </div>

                                                            <div className="ml-3 flex items-center gap-2">

                                                                <span className="text-sm font-bold text-slate-900">
                                                                    {
                                                                        item.count
                                                                    }
                                                                </span>

                                                                <span className="text-xs text-slate-400">
                                                                    {percentage}%
                                                                </span>

                                                            </div>

                                                        </div>

                                                    );

                                                }
                                            )}

                                    </div>

                                </>

                            )}

                        </div>


                        {/* ==================================
                            STATUS CHART
                        ================================== */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">

                            <div className="flex items-start justify-between">

                                <div>

                                    <h2 className="text-lg font-bold text-slate-950">
                                        Response Status
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Emergency handling progress
                                    </p>

                                </div>

                                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">

                                    <Activity size={18} />

                                </div>

                            </div>


                            <div className="mt-8 space-y-7">

                                {statusData.map(
                                    (item) => {

                                        const Icon =
                                            item.icon;

                                        const percentage =
                                            totalEmergencies
                                                ? Math.round(
                                                    (
                                                        item.value /
                                                        totalEmergencies
                                                    ) *
                                                    100
                                                )
                                                : 0;

                                        return (

                                            <div
                                                key={
                                                    item.name
                                                }
                                            >

                                                <div className="mb-2 flex items-center justify-between">

                                                    <div className="flex items-center gap-3">

                                                        <div
                                                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.bg} ${item.text}`}
                                                        >

                                                            <Icon
                                                                size={18}
                                                            />

                                                        </div>

                                                        <div>

                                                            <p className="text-sm font-semibold text-slate-800">
                                                                {
                                                                    item.name
                                                                }
                                                            </p>

                                                            <p className="text-xs text-slate-400">
                                                                {
                                                                    percentage
                                                                }% of total
                                                            </p>

                                                        </div>

                                                    </div>


                                                    <span className="text-xl font-bold text-slate-950">
                                                        {
                                                            item.value
                                                        }
                                                    </span>

                                                </div>


                                                <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                                                    <div
                                                        className={`h-full rounded-full ${item.bar} transition-all duration-700`}
                                                        style={{
                                                            width:
                                                                `${percentage}%`
                                                        }}
                                                    />

                                                </div>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        </div>

                    </section>


                    {/* ==================================
                        STOCK-STYLE HOURLY GRAPH
                    ================================== */}

                    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="border-b border-slate-100 px-6 py-5">

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                    <div className="flex items-center gap-2">

                                        <div className="rounded-lg bg-violet-100 p-2 text-violet-600">

                                            <TrendingUp size={17} />

                                        </div>

                                        <h2 className="text-lg font-bold text-slate-950">
                                            Emergency Activity
                                        </h2>

                                    </div>

                                    <p className="mt-2 text-sm text-slate-500">
                                        Hour-by-hour emergency reporting trend.
                                    </p>

                                </div>


                                {peakHour && (

                                    <div className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-3">

                                        <p className="text-xs font-medium text-violet-600">
                                            Peak activity
                                        </p>

                                        <p className="mt-1 text-sm font-bold text-violet-950">

                                            {String(
                                                peakHour._id
                                            ).padStart(
                                                2,
                                                "0"
                                            )}
                                            :00
                                            {" • "}
                                            {peakHour.count}
                                            {" reports"}

                                        </p>

                                    </div>

                                )}

                            </div>

                        </div>


                        {byHour.length === 0 ? (

                            <div className="flex min-h-[320px] items-center justify-center text-sm text-slate-400">
                                No hourly activity available.
                            </div>

                        ) : (

                            <div className="px-6 pb-6 pt-8">

                                {/* GRAPH */}

                                <div className="relative h-[320px]">

                                    {/* GRID */}

                                    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">

                                        <div className="border-t border-dashed border-slate-200" />
                                        <div className="border-t border-dashed border-slate-200" />
                                        <div className="border-t border-dashed border-slate-200" />
                                        <div className="border-t border-dashed border-slate-200" />
                                        <div className="border-t border-dashed border-slate-200" />

                                    </div>


                                    {/* Y LABELS */}

                                    <div className="pointer-events-none absolute -left-1 top-0 flex h-full -translate-x-full flex-col justify-between pr-3 text-[10px] text-slate-400">

                                        <span>
                                            {maxHourlyCount}
                                        </span>

                                        <span>
                                            {Math.round(
                                                maxHourlyCount *
                                                0.75
                                            )}
                                        </span>

                                        <span>
                                            {Math.round(
                                                maxHourlyCount *
                                                0.5
                                            )}
                                        </span>

                                        <span>
                                            {Math.round(
                                                maxHourlyCount *
                                                0.25
                                            )}
                                        </span>

                                        <span>
                                            0
                                        </span>

                                    </div>


                                    {/* AREA */}

                                    <div className="absolute inset-0 flex items-end gap-1 sm:gap-2">

                                        {hourlyData.map(
                                            (item) => {

                                                const height =
                                                    item.count === 0
                                                        ? 0
                                                        : Math.max(
                                                            (
                                                                item.count /
                                                                maxHourlyCount
                                                            ) * 100,
                                                            3
                                                        );

                                                return (

                                                    <div
                                                        key={
                                                            item.hour
                                                        }
                                                        className="group relative flex h-full flex-1 items-end"
                                                    >

                                                        {/* AREA */}

                                                        <div
                                                            className="absolute bottom-0 left-0 right-0 rounded-t-md bg-gradient-to-t from-indigo-100/80 to-violet-50/10 transition-all duration-500"
                                                            style={{
                                                                height:
                                                                    `${height}%`
                                                            }}
                                                        />


                                                        {/* BAR */}

                                                        <div
                                                            className="relative z-10 mx-auto w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-indigo-500 to-violet-500 transition-all duration-300 group-hover:from-indigo-600 group-hover:to-violet-600"
                                                            style={{
                                                                height:
                                                                    `${height}%`
                                                            }}
                                                        >

                                                            {item.count > 0 && (

                                                                <span className="absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-[10px] font-semibold text-white shadow-lg group-hover:block">

                                                                    {
                                                                        item.count
                                                                    }

                                                                </span>

                                                            )}

                                                        </div>


                                                        {/* HOUR */}

                                                        <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[9px] font-medium text-slate-400">

                                                            {String(
                                                                item.hour
                                                            ).padStart(
                                                                2,
                                                                "0"
                                                            )}

                                                        </span>

                                                    </div>

                                                );

                                            }
                                        )}

                                    </div>

                                </div>


                                {/* X AXIS */}

                                <div className="mt-10 flex justify-between text-[10px] font-medium text-slate-400">

                                    <span>
                                        00:00
                                    </span>

                                    <span>
                                        06:00
                                    </span>

                                    <span>
                                        12:00
                                    </span>

                                    <span>
                                        18:00
                                    </span>

                                    <span>
                                        24:00
                                    </span>

                                </div>

                            </div>

                        )}

                    </section>


                    {/* ==================================
                        BOTTOM ANALYTICS
                    ================================== */}

                    <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">


                        {/* RESOLUTION PERFORMANCE */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                            <div className="flex items-center justify-between">

                                <div>

                                    <h2 className="text-lg font-bold text-slate-950">
                                        Resolution Performance
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Overall emergency resolution rate.
                                    </p>

                                </div>

                                <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600">

                                    <TrendingUp size={19} />

                                </div>

                            </div>


                            <div className="mt-8 flex items-end gap-3">

                                <span className="text-5xl font-bold tracking-tight text-slate-950">
                                    {resolutionRate}%
                                </span>

                                <span className="mb-2 text-sm text-slate-400">
                                    resolved
                                </span>

                            </div>


                            <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-100">

                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
                                    style={{
                                        width:
                                            `${resolutionRate}%`
                                    }}
                                />

                            </div>


                            <div className="mt-4 flex justify-between text-xs text-slate-500">

                                <span>
                                    {resolvedCount} resolved
                                </span>

                                <span>
                                    {activeCount} active
                                </span>

                            </div>

                        </div>


                        {/* SYSTEM SNAPSHOT */}

                        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 text-white shadow-sm">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">

                                    <Activity size={19} />

                                </div>

                                <div>

                                    <h2 className="font-bold">
                                        Operational Snapshot
                                    </h2>

                                    <p className="text-sm text-white/70">
                                        Current system intelligence.
                                    </p>

                                </div>

                            </div>


                            <div className="mt-7 grid grid-cols-2 gap-3">

                                <div className="rounded-xl border border-white/10 bg-white/10 p-4">

                                    <p className="text-xs text-white/60">
                                        Active
                                    </p>

                                    <p className="mt-2 text-2xl font-bold">
                                        {activeCount}
                                    </p>

                                </div>


                                <div className="rounded-xl border border-white/10 bg-white/10 p-4">

                                    <p className="text-xs text-white/60">
                                        Resolved
                                    </p>

                                    <p className="mt-2 text-2xl font-bold">
                                        {resolvedCount}
                                    </p>

                                </div>


                                <div className="rounded-xl border border-white/10 bg-white/10 p-4">

                                    <p className="text-xs text-white/60">
                                        Top Type
                                    </p>

                                    <p className="mt-2 truncate text-sm font-bold capitalize">
                                        {
                                            typeData[0]?.name ||
                                            "N/A"
                                        }
                                    </p>

                                </div>


                                <div className="rounded-xl border border-white/10 bg-white/10 p-4">

                                    <p className="text-xs text-white/60">
                                        Peak Hour
                                    </p>

                                    <p className="mt-2 text-sm font-bold">

                                        {peakHour
                                            ? `${String(
                                                peakHour._id
                                            ).padStart(
                                                2,
                                                "0"
                                            )}:00`
                                            : "N/A"}

                                    </p>

                                </div>

                            </div>

                        </div>

                    </section>

                </main>

            </div>

        </div>
    );
}

export default AdminAnalytics;