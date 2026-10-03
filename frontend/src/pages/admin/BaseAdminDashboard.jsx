import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import {
    getDashboardStats
} from "../../api/dashboard.api";

import {
    getAllEmergencies
} from "../../api/emergency.api";

import AdminHeader from "../../components/admin/AdminHeader";
import AdminStats from "../../components/admin/AdminStats";
import RecentActivity from "../../components/admin/RecentActivity";
import AdminSidebar from "../../components/admin/AdminSidebar";

function BaseAdminDashboard() {
    const navigate = useNavigate();

    const admin = JSON.parse(
        localStorage.getItem("admin") || "null"
    );

    const [dashboardStats, setDashboardStats] =
        useState(null);

    const [emergencies, setEmergencies] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const sirenRef = useRef(null);

    const socketRef = useRef(null);

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

    const stopSiren = () => {
        if (!sirenRef.current) {
            return;
        }

        sirenRef.current.pause();
        sirenRef.current.currentTime = 0;
    };

    const playSiren = async () => {
        try {
            if (!sirenRef.current) {
                const audio = new Audio(
                    "/sounds/emergency-siren.mp3"
                );

                audio.loop = true;
                audio.preload = "auto";

                sirenRef.current = audio;
            }

            sirenRef.current.currentTime = 0;

            await sirenRef.current.play();

            console.log(
                "Emergency siren started"
            );
        } catch (error) {
            console.error(
                "Browser blocked emergency siren:",
                error
            );
        }
    };

    const handleLogout = () => {
        stopSiren();

        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");

        navigate("/admin/login");
    };

    const fetchDashboardData = async (
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
                emergenciesResponse
            ] = await Promise.all([
                getDashboardStats(),
                getAllEmergencies()
            ]);

            setDashboardStats(
                statsResponse.data
            );

            setEmergencies(
                emergenciesResponse.data || []
            );
        } catch (error) {
            console.error(
                "Dashboard fetch error:",
                error
            );

            if (isAuthError(error)) {
                handleLogout();
                return;
            }

            setError(
                error?.message ||
                "Failed to load dashboard data."
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
        fetchDashboardData(true);
    }, []);

    useEffect(() => {
        const token =
            localStorage.getItem("adminToken");

        if (!token) {
            navigate("/admin/login");
            return;
        }

        console.log(
            "Connecting to QuickAid Socket.IO..."
        );

        const socket = io(
            "http://localhost:3001",
            {
                transports: ["websocket"],
                auth: {
                    token
                }
            }
        );

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log(
                "QuickAid Socket.IO connected:",
                socket.id
            );

            socket.emit(
                "join-admin",
                admin?.username ||
                admin?.id ||
                "admin"
            );

            console.log(
                "Joined admin-room"
            );

            fetchDashboardData(false);
        });

        socket.on(
            "emergency-siren",
            async (emergencyData) => {
                console.log(
                    "NEW EMERGENCY RECEIVED:",
                    emergencyData
                );

                setEmergencies(
                    (currentEmergencies) => {
                        const emergencyId =
                            emergencyData?.emergency_id;

                        if (!emergencyId) {
                            return currentEmergencies;
                        }

                        const alreadyExists =
                            currentEmergencies.some(
                                (emergency) =>
                                    emergency.emergency_id ===
                                    emergencyId
                            );

                        if (alreadyExists) {
                            return currentEmergencies;
                        }

                        return [
                            emergencyData,
                            ...currentEmergencies
                        ];
                    }
                );

                await playSiren();

                fetchDashboardData(false);
            }
        );

        socket.on(
            "emergency-status-changed",
            (statusData) => {
                console.log(
                    "Emergency status changed:",
                    statusData
                );

                setEmergencies(
                    (currentEmergencies) =>
                        currentEmergencies.map(
                            (emergency) =>
                                emergency.emergency_id ===
                                    statusData.emergencyId
                                    ? {
                                        ...emergency,
                                        status:
                                            statusData.status,
                                        updated_at:
                                            statusData.timestamp
                                    }
                                    : emergency
                        )
                );

                fetchDashboardData(false);
            }
        );

        socket.on(
            "siren-stopped",
            (data) => {
                console.log(
                    "Siren stopped:",
                    data?.emergencyId
                );

                stopSiren();
            }
        );

        socket.on(
            "connect_error",
            (error) => {
                console.error(
                    "Socket.IO connection error:",
                    error.message
                );
            }
        );

        socket.on(
            "disconnect",
            (reason) => {
                console.log(
                    "Socket disconnected:",
                    reason
                );
            }
        );

        return () => {
            console.log(
                "Cleaning up Socket.IO..."
            );

            socket.off("connect");

            socket.off(
                "emergency-siren"
            );

            socket.off(
                "emergency-status-changed"
            );

            socket.off(
                "siren-stopped"
            );

            socket.off(
                "connect_error"
            );

            socket.off(
                "disconnect"
            );

            socket.disconnect();

            socketRef.current = null;
        };
    }, []);

    useEffect(() => {
        return () => {
            stopSiren();
        };
    }, []);

    const totalEmergencies =
        dashboardStats?.totalEmergencies ??
        dashboardStats?.total ??
        emergencies.length;

    const pendingEmergencies =
        dashboardStats?.pendingEmergencies ??
        dashboardStats?.pending ??
        emergencies.filter(
            (emergency) =>
                emergency.status === "pending"
        ).length;

    const inProgressEmergencies =
        dashboardStats?.inProgressEmergencies ??
        dashboardStats?.inProgress ??
        emergencies.filter(
            (emergency) =>
                emergency.status === "in_progress"
        ).length;

    const resolvedEmergencies =
        dashboardStats?.resolvedEmergencies ??
        dashboardStats?.resolved ??
        emergencies.filter(
            (emergency) =>
                emergency.status === "resolved"
        ).length;

    const criticalEmergencies =
        dashboardStats?.criticalEmergencies ??
        emergencies.filter(
            (emergency) =>
                emergency.severity === "critical"
        ).length;

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-red-600" />

                    <p className="mt-4 font-medium text-slate-600">
                        Loading dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100">

            <AdminSidebar />

            <div className="min-h-screen lg:ml-64">

                <AdminHeader
                    admin={admin}
                    onRefresh={() =>
                        fetchDashboardData(false)
                    }
                    onLogout={handleLogout}
                    refreshing={refreshing}
                />

                <main className="px-4 py-6 sm:px-6 lg:px-8">

                    <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3">

                        <div className="h-2.5 w-2.5 rounded-full bg-green-500" />

                        <p className="text-sm font-medium text-green-700">
                            Real-time emergency monitoring active
                        </p>

                    </div>

                    {error && (
                        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                    <p className="font-semibold text-red-800">
                                        Failed to load dashboard
                                    </p>

                                    <p className="mt-1 text-sm text-red-600">
                                        {error}
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        fetchDashboardData(false)
                                    }
                                    disabled={refreshing}
                                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {refreshing
                                        ? "Refreshing..."
                                        : "Try Again"}
                                </button>

                            </div>

                        </div>
                    )}

                    <AdminStats
                        totalEmergencies={
                            totalEmergencies
                        }
                        pendingEmergencies={
                            pendingEmergencies
                        }
                        inProgressEmergencies={
                            inProgressEmergencies
                        }
                        resolvedEmergencies={
                            resolvedEmergencies
                        }
                        criticalEmergencies={
                            criticalEmergencies
                        }
                    />

                    <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

                        <RecentActivity
                            emergencies={
                                emergencies
                            }
                            formatDate={(date) => {
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
                            }}
                        />

                    </section>

                </main>

            </div>

        </div>
    );
}

export default BaseAdminDashboard;