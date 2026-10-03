import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    MapPin,
    RefreshCw,
    AlertTriangle,
    Navigation,
    Ambulance,
    Car,
    Flame,
    Users,
    Clock,
    Route,
    Radio
} from "lucide-react";

import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";

import {
    getAllEmergencies
} from "../../api/emergency.api";

import {
    getResponseUnits
} from "../../api/responseUnit.api";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Circle,
    Polyline,
    useMap
} from "react-leaflet";

import "leaflet/dist/leaflet.css";


// ======================================================
// COORDINATE VALIDATION
// ======================================================

function isValidCoordinate(latitude, longitude) {
    if (
        latitude === undefined ||
        latitude === null ||
        longitude === undefined ||
        longitude === null
    ) {
        return false;
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
        Number.isNaN(lat) ||
        Number.isNaN(lng)
    ) {
        return false;
    }

    return (
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
    );
}


// ======================================================
// MAP VIEW CONTROLLER
// ======================================================

function MapViewController({
    emergency,
    routeCoordinates
}) {
    const map = useMap();

    useEffect(() => {
        if (!emergency?.location) {
            return;
        }

        const latitude =
            Number(emergency.location.latitude);

        const longitude =
            Number(emergency.location.longitude);

        if (
            !isValidCoordinate(
                latitude,
                longitude
            )
        ) {
            return;
        }

        // ================================================
        // FIT ROUTE
        // ================================================

        if (
            routeCoordinates &&
            routeCoordinates.length > 1
        ) {
            const bounds =
                routeCoordinates.map(
                    (point) => [
                        point[0],
                        point[1]
                    ]
                );

            map.fitBounds(
                bounds,
                {
                    padding: [50, 50],
                    maxZoom: 15,
                    animate: true
                }
            );

            return;
        }

        // ================================================
        // CENTER ON EMERGENCY
        // ================================================

        map.setView(
            [
                latitude,
                longitude
            ],
            15,
            {
                animate: true
            }
        );

    }, [
        emergency,
        routeCoordinates,
        map
    ]);

    return null;
}


// ======================================================
// UNIT ICON
// ======================================================

function UnitIcon({ type }) {
    if (type === "ambulance") {
        return <Ambulance size={20} />;
    }

    if (type === "fire_truck") {
        return <Flame size={20} />;
    }

    if (type === "rescue_team") {
        return <Users size={20} />;
    }

    return <Car size={20} />;
}


// ======================================================
// FORMAT TIME
// ======================================================

function formatDuration(seconds) {
    if (
        seconds === undefined ||
        seconds === null
    ) {
        return "N/A";
    }

    if (seconds === 0) {
        return "0 min";
    }

    const minutes =
        Math.round(seconds / 60);

    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours =
        Math.floor(minutes / 60);

    const remainingMinutes =
        minutes % 60;

    if (remainingMinutes === 0) {
        return `${hours} hr`;
    }

    return `${hours} hr ${remainingMinutes} min`;
}


// ======================================================
// FORMAT DISTANCE
// ======================================================

function formatDistance(meters) {
    if (
        meters === undefined ||
        meters === null
    ) {
        return "N/A";
    }

    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }

    return `${(
        meters / 1000
    ).toFixed(1)} km`;
}


// ======================================================
// FORMAT STATUS
// ======================================================

function formatStatus(status) {
    if (!status) {
        return "Unknown";
    }

    return status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}


// ======================================================
// ADMIN LIVE MAP
// ======================================================

function AdminLiveMap() {
    const navigate = useNavigate();

    // ==================================================
    // ADMIN
    // ==================================================

    const admin = JSON.parse(
        localStorage.getItem("admin") || "null"
    );

    // ==================================================
    // EMERGENCIES
    // ==================================================

    const [
        emergencies,
        setEmergencies
    ] = useState([]);

    const [
        selectedEmergency,
        setSelectedEmergency
    ] = useState(null);

    // ==================================================
    // RESPONSE UNITS
    // ==================================================

    const [
        responseUnits,
        setResponseUnits
    ] = useState([]);

    // ==================================================
    // ROUTE
    // ==================================================

    const [
        routeCoordinates,
        setRouteCoordinates
    ] = useState([]);

    const [
        routeDistance,
        setRouteDistance
    ] = useState(null);

    const [
        routeDuration,
        setRouteDuration
    ] = useState(null);

    const [
        routeLoading,
        setRouteLoading
    ] = useState(false);

    const [
        routeError,
        setRouteError
    ] = useState("");

    // ==================================================
    // GENERAL STATE
    // ==================================================

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        refreshing,
        setRefreshing
    ] = useState(false);

    const [
        error,
        setError
    ] = useState("");

    const [
        sidebarOpen,
        setSidebarOpen
    ] = useState(false);


    // ==================================================
    // AUTH ERROR HANDLER
    // ==================================================

    const handleAuthError = (error) => {
        const message =
            error?.message?.toLowerCase() || "";

        return (
            message.includes("token") ||
            message.includes("unauthorized") ||
            message.includes("authorization") ||
            message.includes("expired")
        );
    };


    // ==================================================
    // LOGOUT
    // ==================================================

    const handleLogout = () => {
        localStorage.removeItem(
            "adminToken"
        );

        localStorage.removeItem(
            "admin"
        );

        navigate(
            "/admin/login"
        );
    };


    // ==================================================
    // FETCH EMERGENCIES
    // ==================================================

    const fetchEmergencies = async (
        showLoader = false
    ) => {
        try {
            if (showLoader) {
                setLoading(true);
            }

            setError("");

            const response =
                await getAllEmergencies();

            const data =
                response.data || [];

            // ============================================
            // ONLY VALID LOCATION DATA
            // ============================================

            const emergenciesWithLocation =
                data.filter(
                    (emergency) =>
                        isValidCoordinate(
                            emergency.location?.latitude,
                            emergency.location?.longitude
                        )
                );

            setEmergencies(
                emergenciesWithLocation
            );

            // ============================================
            // KEEP CURRENT SELECTION
            // ============================================

            if (
                emergenciesWithLocation.length > 0
            ) {
                setSelectedEmergency(
                    (previous) => {
                        if (!previous) {
                            return (
                                emergenciesWithLocation[0]
                            );
                        }

                        const updatedEmergency =
                            emergenciesWithLocation.find(
                                (item) =>
                                    item.emergency_id ===
                                    previous.emergency_id
                            );

                        return (
                            updatedEmergency ||
                            emergenciesWithLocation[0]
                        );
                    }
                );
            } else {
                setSelectedEmergency(null);
            }

        } catch (error) {
            console.error(
                "Emergency map fetch error:",
                error
            );

            if (handleAuthError(error)) {
                handleLogout();
                return;
            }

            setError(
                error.message ||
                "Failed to load emergency locations."
            );

        } finally {
            if (showLoader) {
                setLoading(false);
            }
        }
    };


    // ==================================================
    // FETCH RESPONSE UNITS
    // ==================================================

    const fetchResponseUnits = async () => {
        try {
            const response =
                await getResponseUnits();

            setResponseUnits(
                response.data || []
            );

        } catch (error) {
            console.error(
                "Response unit fetch error:",
                error
            );

            if (handleAuthError(error)) {
                handleLogout();
            }
        }
    };


    // ==================================================
    // INITIAL LOAD
    // ==================================================

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([
                fetchEmergencies(true),
                fetchResponseUnits()
            ]);
        };

        loadData();
    }, []);


    // ==================================================
    // AUTO REFRESH
    // ==================================================

    useEffect(() => {
        const interval =
            setInterval(() => {
                fetchEmergencies(false);
                fetchResponseUnits();
            }, 15000);

        return () => {
            clearInterval(interval);
        };
    }, []);


    // ==================================================
    // MANUAL REFRESH
    // ==================================================

    const handleRefresh = async () => {
        try {
            setRefreshing(true);

            await Promise.all([
                fetchEmergencies(false),
                fetchResponseUnits()
            ]);

        } finally {
            setRefreshing(false);
        }
    };


    // ==================================================
    // FIND ACTIVE UNIT FOR SELECTED EMERGENCY
    // ==================================================

    const assignedUnit =
        selectedEmergency
            ? responseUnits.find(
                (unit) =>
                    unit.assigned_emergency ===
                    selectedEmergency.emergency_id &&
                    (
                        unit.status === "dispatched" ||
                        unit.status === "busy"
                    )
            )
            : null;


    // ==================================================
    // GET REAL ROAD ROUTE
    // ==================================================

    useEffect(() => {
        const fetchRoute = async () => {

            // ============================================
            // RESET ROUTE
            // ============================================

            setRouteCoordinates([]);
            setRouteDistance(null);
            setRouteDuration(null);
            setRouteError("");

            // ============================================
            // NO ACTIVE RESPONSE
            // ============================================

            if (
                !selectedEmergency ||
                !assignedUnit
            ) {
                return;
            }

            // ============================================
            // EMERGENCY COORDINATES
            // ============================================

            const emergencyLatitude =
                Number(
                    selectedEmergency.location?.latitude
                );

            const emergencyLongitude =
                Number(
                    selectedEmergency.location?.longitude
                );

            // ============================================
            // UNIT COORDINATES
            // ============================================

            const unitLatitude =
                Number(
                    assignedUnit.current_location?.latitude
                );

            const unitLongitude =
                Number(
                    assignedUnit.current_location?.longitude
                );

            // ============================================
            // VALIDATE COORDINATES
            // ============================================

            if (
                !isValidCoordinate(
                    emergencyLatitude,
                    emergencyLongitude
                )
            ) {
                setRouteError(
                    "Emergency location coordinates are invalid."
                );

                return;
            }

            if (
                !isValidCoordinate(
                    unitLatitude,
                    unitLongitude
                )
            ) {
                setRouteError(
                    "Response unit location coordinates are invalid."
                );

                return;
            }

            // ============================================
            // SAME LOCATION
            // ============================================

            if (
                emergencyLatitude === unitLatitude &&
                emergencyLongitude === unitLongitude
            ) {
                setRouteCoordinates([
                    [
                        unitLatitude,
                        unitLongitude
                    ]
                ]);

                setRouteDistance(0);
                setRouteDuration(0);

                return;
            }

            // ============================================
            // START ROUTING
            // ============================================

            try {
                setRouteLoading(true);

                /*
                 * OSRM:
                 *
                 * longitude,latitude
                 *
                 * Leaflet:
                 *
                 * latitude,longitude
                 */

                const start =
                    `${unitLongitude},${unitLatitude}`;

                const end =
                    `${emergencyLongitude},${emergencyLatitude}`;

                const url =
                    `https://router.project-osrm.org/route/v1/driving/` +
                    `${start};${end}` +
                    `?overview=full&geometries=geojson`;

                const response =
                    await fetch(url);

                // ========================================
                // HTTP ERROR
                // ========================================

                if (!response.ok) {
                    throw new Error(
                        `Routing service unavailable (${response.status}).`
                    );
                }

                const data =
                    await response.json();

                // ========================================
                // OSRM ERROR
                // ========================================

                if (
                    data.code !== "Ok" ||
                    !data.routes ||
                    data.routes.length === 0
                ) {
                    throw new Error(
                        "No driving route found between the response unit and emergency."
                    );
                }

                const route =
                    data.routes[0];

                // ========================================
                // CONVERT OSRM COORDINATES
                // ========================================

                const coordinates =
                    route.geometry.coordinates.map(
                        ([longitude, latitude]) => [
                            latitude,
                            longitude
                        ]
                    );

                if (
                    coordinates.length < 2
                ) {
                    throw new Error(
                        "Route contains insufficient coordinates."
                    );
                }

                setRouteCoordinates(
                    coordinates
                );

                setRouteDistance(
                    route.distance
                );

                setRouteDuration(
                    route.duration
                );

            } catch (error) {
                console.error(
                    "Route calculation error:",
                    error
                );

                setRouteCoordinates([]);
                setRouteDistance(null);
                setRouteDuration(null);

                setRouteError(
                    error.message ||
                    "Unable to calculate road route."
                );

            } finally {
                setRouteLoading(false);
            }
        };

        fetchRoute();

    }, [
        selectedEmergency?.emergency_id,
        assignedUnit?.unit_id,
        assignedUnit?.status,
        assignedUnit?.current_location?.latitude,
        assignedUnit?.current_location?.longitude
    ]);


    // ==================================================
    // LOADING SCREEN
    // ==================================================

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">

                <div className="text-center">

                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />

                    <p className="mt-4 font-medium text-slate-600">
                        Loading live map...
                    </p>

                </div>

            </div>
        );
    }


    // ==================================================
    // PAGE
    // ==================================================

    return (
        <div className="min-h-screen bg-slate-100">

            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <AdminSidebar
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
            />


            {/* ==================================================
                MAIN AREA
            ================================================== */}

            <div className="min-h-screen lg:ml-64">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <AdminHeader
                    admin={admin}
                    onRefresh={handleRefresh}
                    onLogout={handleLogout}
                />


                <main className="px-4 py-6 sm:px-6 lg:px-8">

                    {/* ==================================================
                        PAGE HEADER
                    ================================================== */}

                    <section className="mb-6">

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                                    <MapPin size={22} />

                                </div>

                                <div>

                                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                        Live Map
                                    </h1>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Monitor emergency locations and active response units.
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                onClick={handleRefresh}
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


                    {/* ==================================================
                        ERROR
                    ================================================== */}

                    {error && (
                        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">

                            <div className="flex items-start gap-3">

                                <AlertTriangle
                                    size={20}
                                    className="mt-0.5 shrink-0 text-red-600"
                                />

                                <div>

                                    <p className="font-semibold text-red-800">
                                        Failed to load map data
                                    </p>

                                    <p className="mt-1 text-sm text-red-700">
                                        {error}
                                    </p>

                                </div>

                            </div>

                        </div>
                    )}


                    {/* ==================================================
                        MAP + SIDE PANEL
                    ================================================== */}

                    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">


                        {/* ==================================================
                            MAP
                        ================================================== */}

                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                            {/* MAP HEADER */}

                            <div className="border-b border-slate-200 px-5 py-4">

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                    <div>

                                        <h2 className="font-semibold text-slate-900">
                                            Emergency Locations
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">

                                            {emergencies.length}{" "}

                                            {emergencies.length === 1
                                                ? "location"
                                                : "locations"}{" "}
                                            available

                                        </p>

                                    </div>


                                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">

                                        <div className="flex items-center gap-1.5">

                                            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />

                                            Emergency

                                        </div>


                                        <div className="flex items-center gap-1.5">

                                            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

                                            Response Unit

                                        </div>


                                        {assignedUnit && (
                                            <div className="flex items-center gap-1.5 font-semibold text-blue-600">

                                                <Radio size={13} />

                                                Active Dispatch

                                            </div>
                                        )}

                                    </div>

                                </div>

                            </div>


                            {/* ==================================================
                                MAP
                            ================================================== */}

                            <div className="h-[600px] w-full">

                                <MapContainer
                                    center={[
                                        20.2961,
                                        85.8245
                                    ]}
                                    zoom={12}
                                    scrollWheelZoom={true}
                                    className="h-full w-full"
                                >

                                    <TileLayer
                                        attribution="&copy; OpenStreetMap contributors"
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />


                                    <MapViewController
                                        emergency={
                                            selectedEmergency
                                        }
                                        routeCoordinates={
                                            routeCoordinates
                                        }
                                    />


                                    {/* ==================================================
                                        EMERGENCY MARKERS
                                    ================================================== */}

                                    {emergencies.map(
                                        (emergency) => {

                                            const latitude =
                                                Number(
                                                    emergency.location.latitude
                                                );

                                            const longitude =
                                                Number(
                                                    emergency.location.longitude
                                                );

                                            const accuracy =
                                                Number(
                                                    emergency.location.accuracy || 0
                                                );

                                            return (
                                                <div
                                                    key={
                                                        emergency.emergency_id
                                                    }
                                                >

                                                    <Marker
                                                        position={[
                                                            latitude,
                                                            longitude
                                                        ]}
                                                        eventHandlers={{
                                                            click: () =>
                                                                setSelectedEmergency(
                                                                    emergency
                                                                )
                                                        }}
                                                    >

                                                        <Popup>

                                                            <div className="min-w-[220px]">

                                                                <p className="font-bold text-slate-900">
                                                                    {
                                                                        emergency.emergency_id
                                                                    }
                                                                </p>


                                                                <p className="mt-1 text-sm capitalize text-slate-600">
                                                                    {
                                                                        emergency.emergency_type
                                                                    }
                                                                </p>


                                                                <p className="mt-1 text-xs font-bold uppercase text-red-600">
                                                                    {
                                                                        emergency.severity
                                                                    }
                                                                </p>


                                                                <p className="mt-1 text-xs text-slate-500">

                                                                    Status:{" "}

                                                                    {
                                                                        formatStatus(
                                                                            emergency.status
                                                                        )
                                                                    }

                                                                </p>


                                                                <p className="mt-1 text-xs capitalize text-slate-500">

                                                                    Department:{" "}

                                                                    {
                                                                        emergency.department ||
                                                                        "Pending"
                                                                    }

                                                                </p>


                                                                <p className="mt-2 text-xs text-slate-500">

                                                                    {
                                                                        emergency.address ||
                                                                        "Address unavailable"
                                                                    }

                                                                </p>

                                                            </div>

                                                        </Popup>

                                                    </Marker>


                                                    {accuracy > 0 && (
                                                        <Circle
                                                            center={[
                                                                latitude,
                                                                longitude
                                                            ]}
                                                            radius={
                                                                accuracy
                                                            }
                                                            pathOptions={{
                                                                fillOpacity: 0.12
                                                            }}
                                                        />
                                                    )}

                                                </div>
                                            );
                                        }
                                    )}


                                    {/* ==================================================
                                        ACTIVE RESPONSE UNIT
                                    ================================================== */}

                                    {assignedUnit &&
                                        isValidCoordinate(
                                            assignedUnit.current_location?.latitude,
                                            assignedUnit.current_location?.longitude
                                        ) && (

                                            <Marker
                                                position={[
                                                    Number(
                                                        assignedUnit.current_location.latitude
                                                    ),
                                                    Number(
                                                        assignedUnit.current_location.longitude
                                                    )
                                                ]}
                                            >

                                                <Popup>

                                                    <div className="min-w-[220px]">

                                                        <div className="flex items-center gap-2">

                                                            <div className="rounded-lg bg-blue-100 p-2 text-blue-600">

                                                                <UnitIcon
                                                                    type={
                                                                        assignedUnit.unit_type
                                                                    }
                                                                />

                                                            </div>

                                                            <div>

                                                                <p className="font-bold text-slate-900">
                                                                    {
                                                                        assignedUnit.unit_name
                                                                    }
                                                                </p>

                                                                <p className="text-xs text-slate-500">
                                                                    {
                                                                        assignedUnit.unit_id
                                                                    }
                                                                </p>

                                                            </div>

                                                        </div>


                                                        <div className="mt-3 rounded-lg bg-blue-50 p-3">

                                                            <div className="flex items-center gap-2 text-blue-700">

                                                                <Radio size={15} />

                                                                <span className="text-sm font-bold">
                                                                    DISPATCHED
                                                                </span>

                                                            </div>

                                                            <p className="mt-1 text-xs text-blue-600">
                                                                Unit is responding to this emergency.
                                                            </p>

                                                        </div>


                                                        <p className="mt-3 text-xs capitalize text-slate-600">

                                                            Department:{" "}

                                                            {
                                                                assignedUnit.department
                                                            }

                                                        </p>


                                                        <p className="mt-1 text-xs capitalize text-slate-600">

                                                            Status:{" "}

                                                            {
                                                                formatStatus(
                                                                    assignedUnit.status
                                                                )
                                                            }

                                                        </p>

                                                    </div>

                                                </Popup>

                                            </Marker>
                                        )}


                                    {/* ==================================================
                                        REAL ROAD ROUTE
                                    ================================================== */}

                                    {routeCoordinates.length > 1 && (

                                        <Polyline
                                            positions={
                                                routeCoordinates
                                            }
                                            pathOptions={{
                                                weight: 6,
                                                opacity: 0.85
                                            }}
                                        />

                                    )}

                                </MapContainer>

                            </div>


                            {/* ==================================================
                                MAP FOOTER
                            ================================================== */}

                            <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">

                                <p className="text-xs text-slate-500">
                                    Map data © OpenStreetMap contributors.
                                    Routing provided by OSRM.
                                </p>

                            </div>

                        </div>


                        {/* ==================================================
                            SIDE PANEL
                        ================================================== */}

                        <div className="space-y-6">


                            {/* ==================================================
                                SELECTED EMERGENCY
                            ================================================== */}

                            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                                <div className="border-b border-slate-200 p-5">

                                    <div className="flex items-center gap-2">

                                        <Navigation
                                            size={19}
                                            className="text-blue-600"
                                        />

                                        <h2 className="font-semibold text-slate-900">
                                            Selected Emergency
                                        </h2>

                                    </div>

                                </div>


                                {selectedEmergency ? (

                                    <div className="p-5">

                                        <div className="flex items-start justify-between gap-3">

                                            <p className="break-all text-sm font-bold text-slate-900">
                                                {
                                                    selectedEmergency.emergency_id
                                                }
                                            </p>


                                            {assignedUnit && (
                                                <span className="flex shrink-0 items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase text-blue-700">

                                                    <Radio size={11} />

                                                    Dispatched

                                                </span>
                                            )}

                                        </div>


                                        <p className="mt-2 text-sm capitalize text-slate-600">

                                            {
                                                selectedEmergency.emergency_type
                                            }

                                            {" • "}

                                            {
                                                selectedEmergency.severity
                                            }

                                        </p>


                                        {/* STATUS */}

                                        <div className="mt-4">

                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                Status
                                            </p>

                                            <p className="mt-1 text-sm font-semibold capitalize text-slate-800">
                                                {
                                                    formatStatus(
                                                        selectedEmergency.status
                                                    )
                                                }
                                            </p>

                                        </div>


                                        {/* DEPARTMENT */}

                                        <div className="mt-4">

                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                Department
                                            </p>

                                            <p className="mt-1 text-sm font-semibold capitalize text-slate-800">
                                                {
                                                    selectedEmergency.department ||
                                                    "Not assigned"
                                                }
                                            </p>

                                        </div>


                                        {/* ACTIVE UNIT */}

                                        {assignedUnit && (

                                            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">

                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-blue-600">

                                                        <UnitIcon
                                                            type={
                                                                assignedUnit.unit_type
                                                            }
                                                        />

                                                    </div>

                                                    <div>

                                                        <p className="text-xs font-medium text-blue-600">
                                                            Active Response Unit
                                                        </p>

                                                        <p className="font-bold text-blue-900">
                                                            {
                                                                assignedUnit.unit_id
                                                            }
                                                        </p>

                                                    </div>

                                                </div>

                                            </div>

                                        )}


                                        {/* LOCATION */}

                                        <div className="mt-4">

                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                Location
                                            </p>

                                            <p className="mt-1 text-sm leading-5 text-slate-600">
                                                {
                                                    selectedEmergency.address ||
                                                    "Address unavailable"
                                                }
                                            </p>

                                        </div>

                                    </div>

                                ) : (

                                    <div className="p-8 text-center">

                                        <MapPin
                                            size={32}
                                            className="mx-auto text-slate-300"
                                        />

                                        <p className="mt-3 text-sm text-slate-500">
                                            Select an emergency from the list.
                                        </p>

                                    </div>

                                )}

                            </div>


                            {/* ==================================================
                                ACTIVE RESPONSE
                            ================================================== */}

                            {selectedEmergency && (

                                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                                    <div className="border-b border-slate-200 p-5">

                                        <div className="flex items-center gap-2">

                                            <Route
                                                size={19}
                                                className="text-blue-600"
                                            />

                                            <h2 className="font-semibold text-slate-900">
                                                Active Response
                                            </h2>

                                        </div>

                                    </div>


                                    <div className="p-5">

                                        {!assignedUnit && (

                                            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">

                                                <div className="flex items-start gap-3">

                                                    <AlertTriangle
                                                        size={19}
                                                        className="mt-0.5 shrink-0 text-yellow-600"
                                                    />

                                                    <div>

                                                        <p className="text-sm font-semibold text-yellow-800">
                                                            No active response unit
                                                        </p>

                                                        <p className="mt-1 text-xs leading-5 text-yellow-700">
                                                            This emergency does not currently have a dispatched response unit.
                                                        </p>

                                                    </div>

                                                </div>

                                            </div>

                                        )}


                                        {assignedUnit && (

                                            <div>

                                                {/* UNIT CARD */}

                                                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-blue-600">

                                                            <UnitIcon
                                                                type={
                                                                    assignedUnit.unit_type
                                                                }
                                                            />

                                                        </div>


                                                        <div className="min-w-0">

                                                            <div className="flex items-center gap-2">

                                                                <p className="font-semibold text-slate-900">
                                                                    {
                                                                        assignedUnit.unit_name
                                                                    }
                                                                </p>

                                                                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                                                                    Active
                                                                </span>

                                                            </div>

                                                            <p className="text-sm text-slate-500">
                                                                {
                                                                    assignedUnit.unit_id
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>


                                                    {/* UNIT DETAILS */}

                                                    <div className="mt-4 space-y-2">

                                                        <div className="flex justify-between text-sm">

                                                            <span className="text-slate-500">
                                                                Department
                                                            </span>

                                                            <span className="font-semibold capitalize text-slate-800">
                                                                {
                                                                    assignedUnit.department
                                                                }
                                                            </span>

                                                        </div>


                                                        <div className="flex justify-between text-sm">

                                                            <span className="text-slate-500">
                                                                Type
                                                            </span>

                                                            <span className="font-semibold capitalize text-slate-800">
                                                                {
                                                                    formatStatus(
                                                                        assignedUnit.unit_type
                                                                    )
                                                                }
                                                            </span>

                                                        </div>


                                                        <div className="flex justify-between text-sm">

                                                            <span className="text-slate-500">
                                                                Status
                                                            </span>

                                                            <span className="font-semibold capitalize text-blue-600">
                                                                {
                                                                    formatStatus(
                                                                        assignedUnit.status
                                                                    )
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </div>


                                                {/* ROUTE LOADING */}

                                                {routeLoading && (

                                                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-blue-50 p-4">

                                                        <RefreshCw
                                                            size={18}
                                                            className="animate-spin text-blue-600"
                                                        />

                                                        <div>

                                                            <p className="text-sm font-semibold text-blue-800">
                                                                Calculating road route...
                                                            </p>

                                                            <p className="mt-1 text-xs text-blue-600">
                                                                Finding the driving route to the emergency.
                                                            </p>

                                                        </div>

                                                    </div>

                                                )}


                                                {/* ROUTE ERROR */}

                                                {routeError &&
                                                    !routeLoading && (

                                                        <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4">

                                                            <div className="flex items-start gap-3">

                                                                <AlertTriangle
                                                                    size={18}
                                                                    className="mt-0.5 shrink-0 text-orange-600"
                                                                />

                                                                <div>

                                                                    <p className="text-sm font-semibold text-orange-800">
                                                                        Road route unavailable
                                                                    </p>

                                                                    <p className="mt-1 text-xs leading-5 text-orange-700">
                                                                        {routeError}
                                                                    </p>

                                                                    <p className="mt-2 text-[11px] leading-4 text-orange-600">
                                                                        The response unit and emergency are still shown on the map.
                                                                    </p>

                                                                </div>

                                                            </div>

                                                        </div>

                                                    )}


                                                {/* ROUTE INFORMATION */}

                                                {!routeLoading &&
                                                    !routeError &&
                                                    routeCoordinates.length > 1 && (

                                                        <div className="mt-4 grid grid-cols-2 gap-3">

                                                            <div className="rounded-xl bg-slate-50 p-4">

                                                                <div className="flex items-center gap-2">

                                                                    <Route
                                                                        size={17}
                                                                        className="text-blue-600"
                                                                    />

                                                                    <p className="text-xs font-medium text-slate-500">
                                                                        Distance
                                                                    </p>

                                                                </div>

                                                                <p className="mt-2 text-lg font-bold text-slate-900">
                                                                    {
                                                                        formatDistance(
                                                                            routeDistance
                                                                        )
                                                                    }
                                                                </p>

                                                            </div>


                                                            <div className="rounded-xl bg-slate-50 p-4">

                                                                <div className="flex items-center gap-2">

                                                                    <Clock
                                                                        size={17}
                                                                        className="text-blue-600"
                                                                    />

                                                                    <p className="text-xs font-medium text-slate-500">
                                                                        ETA
                                                                    </p>

                                                                </div>

                                                                <p className="mt-2 text-lg font-bold text-slate-900">
                                                                    {
                                                                        formatDuration(
                                                                            routeDuration
                                                                        )
                                                                    }
                                                                </p>

                                                            </div>

                                                        </div>

                                                    )}

                                            </div>

                                        )}

                                    </div>

                                </div>

                            )}


                            {/* ==================================================
                                EMERGENCY LOCATION LIST
                            ================================================== */}

                            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                                <div className="border-b border-slate-200 p-5">

                                    <div className="flex items-center justify-between gap-3">

                                        <div className="flex items-center gap-2">

                                            <Navigation
                                                size={19}
                                                className="text-blue-600"
                                            />

                                            <h2 className="font-semibold text-slate-900">
                                                Emergency Locations
                                            </h2>

                                        </div>

                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                            {emergencies.length}
                                        </span>

                                    </div>

                                </div>


                                <div className="max-h-[450px] space-y-3 overflow-y-auto p-4">

                                    {emergencies.length === 0 ? (

                                        <div className="flex min-h-[250px] items-center justify-center text-center">

                                            <div>

                                                <MapPin
                                                    size={35}
                                                    className="mx-auto text-slate-300"
                                                />

                                                <p className="mt-3 font-medium text-slate-700">
                                                    No locations available
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    No emergency reports contain valid coordinates.
                                                </p>

                                            </div>

                                        </div>

                                    ) : (

                                        emergencies.map(
                                            (emergency) => {

                                                const isSelected =
                                                    selectedEmergency?.emergency_id ===
                                                    emergency.emergency_id;


                                                const unitForEmergency =
                                                    responseUnits.find(
                                                        (unit) =>
                                                            unit.assigned_emergency ===
                                                            emergency.emergency_id &&
                                                            (
                                                                unit.status === "dispatched" ||
                                                                unit.status === "busy"
                                                            )
                                                    );


                                                return (

                                                    <button
                                                        key={
                                                            emergency.emergency_id
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedEmergency(
                                                                emergency
                                                            )
                                                        }
                                                        className={`
                                                            w-full rounded-xl border p-4 text-left transition
                                                            ${isSelected
                                                                ? "border-blue-300 bg-blue-50"
                                                                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                                            }
                                                        `}
                                                    >

                                                        {/* TOP */}

                                                        <div className="flex items-start justify-between gap-3">

                                                            <div className="min-w-0">

                                                                <p className="truncate text-sm font-semibold text-slate-900">
                                                                    {
                                                                        emergency.emergency_id
                                                                    }
                                                                </p>


                                                                <p className="mt-1 text-xs capitalize text-slate-500">

                                                                    {
                                                                        emergency.emergency_type
                                                                    }

                                                                    {" • "}

                                                                    {
                                                                        formatStatus(
                                                                            emergency.status
                                                                        )
                                                                    }

                                                                </p>

                                                            </div>


                                                            <span className="shrink-0 rounded-full bg-red-100 px-2 py-1 text-[10px] font-bold uppercase text-red-700">

                                                                {
                                                                    emergency.severity
                                                                }

                                                            </span>

                                                        </div>


                                                        {/* ADDRESS */}

                                                        <p className="mt-2 line-clamp-2 text-xs text-slate-500">

                                                            {
                                                                emergency.address ||
                                                                "Address unavailable"
                                                            }

                                                        </p>


                                                        {/* DISPATCHED UNIT */}

                                                        {unitForEmergency ? (

                                                            <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5">

                                                                <div className="flex items-center gap-2">

                                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-600">

                                                                        <UnitIcon
                                                                            type={
                                                                                unitForEmergency.unit_type
                                                                            }
                                                                        />

                                                                    </div>


                                                                    <div className="min-w-0 flex-1">

                                                                        <div className="flex items-center justify-between gap-2">

                                                                            <p className="text-xs font-bold text-blue-900">
                                                                                {
                                                                                    unitForEmergency.unit_id
                                                                                }
                                                                            </p>

                                                                            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                                                                                Dispatched
                                                                            </span>

                                                                        </div>


                                                                        <p className="mt-0.5 text-[11px] capitalize text-blue-600">

                                                                            {
                                                                                formatStatus(
                                                                                    unitForEmergency.status
                                                                                )
                                                                            }

                                                                        </p>

                                                                    </div>

                                                                </div>

                                                            </div>

                                                        ) : (

                                                            <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">

                                                                <Radio
                                                                    size={14}
                                                                    className="text-slate-400"
                                                                />

                                                                <p className="text-[11px] text-slate-500">
                                                                    No active dispatch
                                                                </p>

                                                            </div>

                                                        )}

                                                    </button>

                                                );
                                            }
                                        )

                                    )}

                                </div>

                            </div>

                        </div>

                    </section>

                </main>

            </div>

        </div>
    );
}

export default AdminLiveMap;