import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Ambulance,
    Car,
    Flame,
    RefreshCw,
    Shield,
    Users,
    Plus,
    X,
    Clock
} from "lucide-react";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";

import {
    getResponseUnits,
    createResponseUnit
} from "../../api/responseUnit.api";

function AdminResponseUnits() {
    const navigate = useNavigate();

    // ==========================================
    // UNIT STATE
    // ==========================================

    const [units, setUnits] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    // ==========================================
    // REGISTER MODAL STATE
    // ==========================================

    const [
        showRegisterForm,
        setShowRegisterForm
    ] = useState(false);

    const [
        registerLoading,
        setRegisterLoading
    ] = useState(false);

    const [
        registerError,
        setRegisterError
    ] = useState("");

    // ==========================================
    // FORM STATE
    // ==========================================

    const [formData, setFormData] = useState({
        unit_id: "",
        unit_type: "",
        department: "",
        unit_name: "",
        latitude: "",
        longitude: ""
    });

    // ==========================================
    // ADMIN
    // ==========================================

    const admin = JSON.parse(
        localStorage.getItem("admin") || "null"
    );

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
    // AUTH ERROR CHECK
    // ==========================================

    const isAuthError = (error) => {
        const message =
            error?.message?.toLowerCase() || "";

        return (
            message.includes("token") ||
            message.includes("authorization") ||
            message.includes("unauthorized") ||
            message.includes("expired")
        );
    };

    // ==========================================
    // FETCH UNITS
    // ==========================================

    const fetchUnits = async (
        showInitialLoader = false
    ) => {
        try {
            if (showInitialLoader) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");

            const response =
                await getResponseUnits();

            setUnits(
                response.data || []
            );

        } catch (error) {
            console.error(
                "Error fetching response units:",
                error
            );

            if (isAuthError(error)) {
                handleLogout();
                return;
            }

            setError(
                error.message ||
                "Failed to load response units."
            );

        } finally {
            if (showInitialLoader) {
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
        fetchUnits(true);
    }, []);

    // ==========================================
    // FORM INPUT CHANGE
    // ==========================================

    const handleInputChange = (event) => {
        const {
            name,
            value
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // ==========================================
    // OPEN REGISTER FORM
    // ==========================================

    const handleOpenRegisterForm = () => {
        setRegisterError("");

        setFormData({
            unit_id: "",
            unit_type: "",
            department: "",
            unit_name: "",
            latitude: "",
            longitude: ""
        });

        setShowRegisterForm(true);
    };

    // ==========================================
    // CLOSE REGISTER FORM
    // ==========================================

    const handleCloseRegisterForm = () => {
        if (registerLoading) {
            return;
        }

        setShowRegisterForm(false);
        setRegisterError("");
    };

    // ==========================================
    // REGISTER UNIT
    // ==========================================

    const handleRegisterUnit = async (event) => {
        event.preventDefault();

        setRegisterError("");

        // ==========================================
        // REQUIRED FIELD VALIDATION
        // ==========================================

        if (
            !formData.unit_id.trim() ||
            !formData.unit_type ||
            !formData.department ||
            !formData.unit_name.trim() ||
            formData.latitude === "" ||
            formData.longitude === ""
        ) {
            setRegisterError(
                "Please fill in all fields."
            );

            return;
        }

        // ==========================================
        // COORDINATE VALIDATION
        // ==========================================

        const latitude =
            Number(formData.latitude);

        const longitude =
            Number(formData.longitude);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            setRegisterError(
                "Latitude and longitude must be valid numbers."
            );

            return;
        }

        if (
            latitude < -90 ||
            latitude > 90
        ) {
            setRegisterError(
                "Latitude must be between -90 and 90."
            );

            return;
        }

        if (
            longitude < -180 ||
            longitude > 180
        ) {
            setRegisterError(
                "Longitude must be between -180 and 180."
            );

            return;
        }

        // ==========================================
        // REGISTER
        // ==========================================

        try {
            setRegisterLoading(true);

            await createResponseUnit({
                unit_id:
                    formData.unit_id.trim(),

                unit_type:
                    formData.unit_type,

                department:
                    formData.department,

                unit_name:
                    formData.unit_name.trim(),

                current_location: {
                    latitude,
                    longitude
                }
            });

            // ==========================================
            // RESET
            // ==========================================

            setFormData({
                unit_id: "",
                unit_type: "",
                department: "",
                unit_name: "",
                latitude: "",
                longitude: ""
            });

            setShowRegisterForm(false);

            // ==========================================
            // REFRESH
            // ==========================================

            await fetchUnits(false);

        } catch (error) {
            console.error(
                "Error registering response unit:",
                error
            );

            if (isAuthError(error)) {
                handleLogout();
                return;
            }

            setRegisterError(
                error.message ||
                "Failed to register response unit."
            );

        } finally {
            setRegisterLoading(false);
        }
    };

    // ==========================================
    // UNIT ICON
    // ==========================================

    const getUnitIcon = (type) => {
        if (type === "ambulance") {
            return <Ambulance size={22} />;
        }

        if (type === "fire_truck") {
            return <Flame size={22} />;
        }

        if (type === "rescue_team") {
            return <Users size={22} />;
        }

        return <Car size={22} />;
    };

    // ==========================================
    // STATUS STYLE
    // ==========================================

    const getStatusStyle = (status) => {
        switch (status) {
            case "available":
                return "bg-green-100 text-green-700";

            case "dispatched":
                return "bg-blue-100 text-blue-700";

            case "busy":
                return "bg-orange-100 text-orange-700";

            case "offline":
                return "bg-slate-200 text-slate-600";

            default:
                return "bg-slate-100 text-slate-600";
        }
    };

    // ==========================================
    // FORMAT STATUS
    // ==========================================

    const formatStatus = (status) => {
        if (!status) {
            return "Unknown";
        }

        return status.replace(
            /_/g,
            " "
        );
    };

    // ==========================================
    // FORMAT UNIT TYPE
    // ==========================================

    const formatUnitType = (type) => {
        if (!type) {
            return "Unknown";
        }

        return type.replace(
            /_/g,
            " "
        );
    };

    // ==========================================
    // FORMAT COORDINATE
    // ==========================================

    const formatCoordinate = (value) => {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return "Unavailable";
        }

        return number.toFixed(4);
    };

    // ==========================================
    // FORMAT COOLDOWN
    // ==========================================

    const formatCooldown = (
        cooldownUntil
    ) => {
        if (!cooldownUntil) {
            return null;
        }

        const cooldownDate =
            new Date(cooldownUntil);

        if (
            Number.isNaN(
                cooldownDate.getTime()
            )
        ) {
            return null;
        }

        if (
            cooldownDate <= new Date()
        ) {
            return null;
        }

        return cooldownDate.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };

    // ==========================================
    // STATISTICS
    // ==========================================

    const availableCount =
        units.filter(
            (unit) =>
                unit.status ===
                "available"
        ).length;

    const dispatchedCount =
        units.filter(
            (unit) =>
                unit.status ===
                "dispatched"
        ).length;

    const busyCount =
        units.filter(
            (unit) =>
                unit.status ===
                "busy"
        ).length;

    const offlineCount =
        units.filter(
            (unit) =>
                unit.status ===
                "offline"
        ).length;

    // ==========================================
    // UI
    // ==========================================

    return (
        <div className="min-h-screen bg-slate-100">

            {/* ==================================
                SIDEBAR
            ================================== */}

            <AdminSidebar />


            <div className="lg:ml-64">

                {/* ==================================
                    HEADER
                ================================== */}

                <AdminHeader
                    admin={admin}
                    onRefresh={() =>
                        fetchUnits(false)
                    }
                    onLogout={handleLogout}
                    refreshing={refreshing}
                />


                <main className="p-4 sm:p-6">

                    {/* ==================================
                        PAGE HEADER
                    ================================== */}

                    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">

                        <div>

                            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                                Response Units
                            </h1>

                            <p className="mt-1 text-sm text-slate-500 sm:text-base">
                                Monitor police, medical, and fire response units.
                            </p>

                        </div>


                        <div className="flex flex-wrap gap-3">

                            {/* REGISTER */}

                            <button
                                type="button"
                                onClick={
                                    handleOpenRegisterForm
                                }
                                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >

                                <Plus size={18} />

                                Register Response Unit

                            </button>


                            {/* REFRESH */}

                            <button
                                type="button"
                                onClick={() =>
                                    fetchUnits(false)
                                }
                                disabled={refreshing}
                                className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                <RefreshCw
                                    size={18}
                                    className={
                                        refreshing
                                            ? "animate-spin"
                                            : ""
                                    }
                                />

                                {refreshing
                                    ? "Refreshing..."
                                    : "Refresh Units"}

                            </button>

                        </div>

                    </div>


                    {/* ==================================
                        ERROR
                    ================================== */}

                    {error && (

                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                            {error}

                        </div>

                    )}


                    {/* ==================================
                        STATISTICS
                    ================================== */}

                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">


                        {/* TOTAL */}

                        <div className="rounded-xl bg-white p-5 shadow-sm">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-sm text-slate-500">
                                        Total Units
                                    </p>

                                    <p className="mt-1 text-3xl font-bold text-slate-900">
                                        {units.length}
                                    </p>

                                </div>


                                <div className="rounded-lg bg-slate-100 p-3 text-slate-600">

                                    <Shield size={24} />

                                </div>

                            </div>

                        </div>


                        {/* AVAILABLE */}

                        <div className="rounded-xl bg-white p-5 shadow-sm">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-sm text-slate-500">
                                        Available
                                    </p>

                                    <p className="mt-1 text-3xl font-bold text-green-600">
                                        {availableCount}
                                    </p>

                                </div>


                                <div className="rounded-lg bg-green-100 p-3 text-green-600">

                                    <Shield size={24} />

                                </div>

                            </div>

                        </div>


                        {/* DISPATCHED */}

                        <div className="rounded-xl bg-white p-5 shadow-sm">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-sm text-slate-500">
                                        Dispatched
                                    </p>

                                    <p className="mt-1 text-3xl font-bold text-blue-600">
                                        {dispatchedCount}
                                    </p>

                                </div>


                                <div className="rounded-lg bg-blue-100 p-3 text-blue-600">

                                    <Car size={24} />

                                </div>

                            </div>

                        </div>


                        {/* BUSY / OFFLINE */}

                        <div className="rounded-xl bg-white p-5 shadow-sm">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-sm text-slate-500">
                                        Busy / Offline
                                    </p>

                                    <p className="mt-1 text-3xl font-bold text-orange-600">
                                        {busyCount +
                                            offlineCount}
                                    </p>

                                </div>


                                <div className="rounded-lg bg-orange-100 p-3 text-orange-600">

                                    <Users size={24} />

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* ==================================
                        RESPONSE FLEET
                    ================================== */}

                    <div className="rounded-xl bg-white shadow-sm">

                        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">

                            <h2 className="text-lg font-bold text-slate-900">
                                Response Fleet
                            </h2>

                            <p className="text-sm text-slate-500">
                                Current status of all registered response units.
                            </p>

                        </div>


                        {loading ? (

                            <div className="flex items-center justify-center p-12">

                                <RefreshCw
                                    size={28}
                                    className="animate-spin text-red-600"
                                />

                            </div>

                        ) : units.length === 0 ? (

                            <div className="p-12 text-center">

                                <Shield
                                    size={40}
                                    className="mx-auto text-slate-300"
                                />

                                <h3 className="mt-3 font-semibold text-slate-700">
                                    No response units found
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Register response units to see them here.
                                </p>

                                <button
                                    type="button"
                                    onClick={
                                        handleOpenRegisterForm
                                    }
                                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >

                                    <Plus size={17} />

                                    Register First Unit

                                </button>

                            </div>

                        ) : (

                            <div className="grid grid-cols-1 gap-4 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-3">

                                {units.map((unit) => {

                                    const cooldownTime =
                                        formatCooldown(
                                            unit.cooldown_until
                                        );

                                    return (

                                        <div
                                            key={
                                                unit.unit_id
                                            }
                                            className="rounded-xl border border-slate-200 p-5 transition hover:shadow-md"
                                        >

                                            {/* ==================================
                                                UNIT HEADER
                                            ================================== */}

                                            <div className="flex items-start justify-between gap-3">

                                                <div className="flex min-w-0 items-center gap-3">

                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">

                                                        {getUnitIcon(
                                                            unit.unit_type
                                                        )}

                                                    </div>


                                                    <div className="min-w-0">

                                                        <h3 className="truncate font-bold text-slate-900">
                                                            {
                                                                unit.unit_name
                                                            }
                                                        </h3>

                                                        <p className="truncate text-sm text-slate-500">
                                                            {
                                                                unit.unit_id
                                                            }
                                                        </p>

                                                    </div>

                                                </div>


                                                {/* STATUS */}

                                                <span
                                                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                                                        unit.status
                                                    )}`}
                                                >
                                                    {formatStatus(
                                                        unit.status
                                                    )}
                                                </span>

                                            </div>


                                            {/* ==================================
                                                DETAILS
                                            ================================== */}

                                            <div className="mt-5 space-y-3">

                                                {/* DEPARTMENT */}

                                                <div className="flex justify-between gap-4 text-sm">

                                                    <span className="text-slate-500">
                                                        Department
                                                    </span>

                                                    <span className="text-right font-semibold capitalize text-slate-800">
                                                        {
                                                            unit.department ||
                                                            "N/A"
                                                        }
                                                    </span>

                                                </div>


                                                {/* TYPE */}

                                                <div className="flex justify-between gap-4 text-sm">

                                                    <span className="text-slate-500">
                                                        Unit Type
                                                    </span>

                                                    <span className="text-right font-semibold capitalize text-slate-800">
                                                        {
                                                            formatUnitType(
                                                                unit.unit_type
                                                            )
                                                        }
                                                    </span>

                                                </div>


                                                {/* ASSIGNED EMERGENCY */}

                                                <div className="flex justify-between gap-4 text-sm">

                                                    <span className="text-slate-500">
                                                        Assigned Emergency
                                                    </span>

                                                    <span className="max-w-[180px] truncate text-right font-semibold text-slate-800">
                                                        {
                                                            unit.assigned_emergency ||
                                                            "None"
                                                        }
                                                    </span>

                                                </div>


                                                {/* LOCATION */}

                                                <div className="flex justify-between gap-4 text-sm">

                                                    <span className="text-slate-500">
                                                        Location
                                                    </span>

                                                    <span className="text-right font-semibold text-slate-800">

                                                        {unit.current_location
                                                            ? `${formatCoordinate(
                                                                unit.current_location.latitude
                                                            )}, ${formatCoordinate(
                                                                unit.current_location.longitude
                                                            )}`
                                                            : "Unavailable"}

                                                    </span>

                                                </div>

                                            </div>


                                            {/* ==================================
                                                COOLDOWN
                                            ================================== */}

                                            {unit.status === "busy" &&
                                                cooldownTime && (

                                                    <div className="mt-4 flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3">

                                                        <Clock
                                                            size={16}
                                                            className="mt-0.5 shrink-0 text-orange-600"
                                                        />

                                                        <div>

                                                            <p className="text-xs font-semibold text-orange-800">
                                                                Cooldown active
                                                            </p>

                                                            <p className="mt-1 text-[11px] text-orange-700">
                                                                Unit can become available after {cooldownTime}.
                                                            </p>

                                                        </div>

                                                    </div>

                                                )}

                                        </div>

                                    );
                                })}

                            </div>

                        )}

                    </div>

                </main>

            </div>


            {/* ==========================================
                REGISTER RESPONSE UNIT MODAL
            ========================================== */}

            {showRegisterForm && (

                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">


                        {/* ==================================
                            MODAL HEADER
                        ================================== */}

                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

                            <div>

                                <h2 className="text-xl font-bold text-slate-900">
                                    Register Response Unit
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Add a police, medical, or fire response unit.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    handleCloseRegisterForm
                                }
                                disabled={
                                    registerLoading
                                }
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                            >

                                <X size={20} />

                            </button>

                        </div>


                        {/* ==================================
                            FORM
                        ================================== */}

                        <form
                            onSubmit={
                                handleRegisterUnit
                            }
                            className="space-y-5 p-6"
                        >

                            {/* FORM ERROR */}

                            {registerError && (

                                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                    {registerError}
                                </div>

                            )}


                            {/* UNIT ID */}

                            <div>

                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                    Unit ID
                                </label>

                                <input
                                    type="text"
                                    name="unit_id"
                                    value={
                                        formData.unit_id
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="AMB-01"
                                    autoComplete="off"
                                    disabled={
                                        registerLoading
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                />

                            </div>


                            {/* UNIT TYPE */}

                            <div>

                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                    Unit Type
                                </label>

                                <select
                                    name="unit_type"
                                    value={
                                        formData.unit_type
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    disabled={
                                        registerLoading
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                >

                                    <option value="">
                                        Select unit type
                                    </option>

                                    <option value="police_car">
                                        Police Car
                                    </option>

                                    <option value="ambulance">
                                        Ambulance
                                    </option>

                                    <option value="fire_truck">
                                        Fire Truck
                                    </option>

                                    <option value="rescue_team">
                                        Rescue Team
                                    </option>

                                </select>

                            </div>


                            {/* DEPARTMENT */}

                            <div>

                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                    Department
                                </label>

                                <select
                                    name="department"
                                    value={
                                        formData.department
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    disabled={
                                        registerLoading
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                >

                                    <option value="">
                                        Select department
                                    </option>

                                    <option value="police">
                                        Police
                                    </option>

                                    <option value="medical">
                                        Medical
                                    </option>

                                    <option value="fire">
                                        Fire
                                    </option>

                                </select>

                            </div>


                            {/* UNIT NAME */}

                            <div>

                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                    Unit Name
                                </label>

                                <input
                                    type="text"
                                    name="unit_name"
                                    value={
                                        formData.unit_name
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="City Ambulance 01"
                                    autoComplete="off"
                                    disabled={
                                        registerLoading
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                />

                            </div>


                            {/* LOCATION */}

                            <div>

                                <p className="mb-2 text-sm font-semibold text-slate-700">
                                    Current Location
                                </p>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">


                                    {/* LATITUDE */}

                                    <div>

                                        <label className="mb-1.5 block text-xs font-medium text-slate-500">
                                            Latitude
                                        </label>

                                        <input
                                            type="number"
                                            name="latitude"
                                            value={
                                                formData.latitude
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="20.2961"
                                            step="any"
                                            min="-90"
                                            max="90"
                                            disabled={
                                                registerLoading
                                            }
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                        />

                                    </div>


                                    {/* LONGITUDE */}

                                    <div>

                                        <label className="mb-1.5 block text-xs font-medium text-slate-500">
                                            Longitude
                                        </label>

                                        <input
                                            type="number"
                                            name="longitude"
                                            value={
                                                formData.longitude
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="85.8245"
                                            step="any"
                                            min="-180"
                                            max="180"
                                            disabled={
                                                registerLoading
                                            }
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                        />

                                    </div>

                                </div>

                            </div>


                            {/* ==================================
                                ACTIONS
                            ================================== */}

                            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">

                                <button
                                    type="button"
                                    onClick={
                                        handleCloseRegisterForm
                                    }
                                    disabled={
                                        registerLoading
                                    }
                                    className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={
                                        registerLoading
                                    }
                                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    {registerLoading ? (
                                        <>
                                            <RefreshCw
                                                size={17}
                                                className="animate-spin"
                                            />

                                            Registering...
                                        </>
                                    ) : (
                                        <>
                                            <Plus
                                                size={17}
                                            />

                                            Register Unit
                                        </>
                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default AdminResponseUnits;