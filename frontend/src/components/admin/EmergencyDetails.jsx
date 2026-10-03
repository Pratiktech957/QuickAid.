import {
    BarChart3,
    AlertTriangle,
    MapPin,
    Play,
    Check,
    Users,
    Ambulance,
    Truck,
    Radio
} from "lucide-react";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Circle,
    useMap
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { useEffect, useState } from "react";

import {
    updateEmergencyStatus,
    assignDepartment
} from "../../api/emergency.api";

import {
    getAvailableUnits
} from "../../api/responseUnit.api";

import {
    dispatchUnit,
    updateDispatchStatus,
    getDispatchByEmergency
} from "../../api/dispatch.api";


// ==========================================
// DETAIL ITEM
// ==========================================

function DetailItem({ label, value }) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-700">
                {value}
            </p>
        </div>
    );
}


// ==========================================
// MAP CENTER
// ==========================================

function MapCenter({ latitude, longitude }) {
    const map = useMap();

    useEffect(() => {
        map.setView(
            [latitude, longitude],
            15,
            {
                animate: true
            }
        );
    }, [latitude, longitude, map]);

    return null;
}


// ==========================================
// EMERGENCY LOCATION MAP
// ==========================================

function EmergencyLocationMap({ emergency }) {
    const latitude =
        emergency.location?.latitude;

    const longitude =
        emergency.location?.longitude;

    const accuracy =
        emergency.location?.accuracy;

    // ==========================================
    // NO LOCATION
    // ==========================================

    if (
        latitude === undefined ||
        longitude === undefined
    ) {
        return (
            <div className="flex h-80 items-center justify-center bg-slate-200">
                <div className="text-center text-slate-500">
                    <MapPin
                        size={45}
                        className="mx-auto mb-3"
                    />

                    <p className="font-semibold">
                        Location unavailable
                    </p>

                    <p className="mt-1 text-sm">
                        Emergency location was not provided.
                    </p>
                </div>
            </div>
        );
    }

    // ==========================================
    // MAP
    // ==========================================

    return (
        <MapContainer
            center={[
                latitude,
                longitude
            ]}
            zoom={15}
            scrollWheelZoom={true}
            className="h-80 w-full"
        >
            <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapCenter
                latitude={latitude}
                longitude={longitude}
            />

            <Marker
                position={[
                    latitude,
                    longitude
                ]}
            >
                <Popup>
                    <div className="min-w-[180px]">
                        <p className="font-bold text-slate-800">
                            Emergency Location
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                            {emergency.user_name}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                            Latitude: {latitude}
                        </p>

                        <p className="text-xs text-slate-500">
                            Longitude: {longitude}
                        </p>

                        {emergency.address && (
                            <p className="mt-2 text-xs text-slate-500">
                                {emergency.address}
                            </p>
                        )}
                    </div>
                </Popup>
            </Marker>

            {/* GPS Accuracy Circle */}

            {accuracy && (
                <Circle
                    center={[
                        latitude,
                        longitude
                    ]}
                    radius={accuracy}
                    pathOptions={{
                        fillOpacity: 0.15
                    }}
                />
            )}
        </MapContainer>
    );
}


// ==========================================
// EMERGENCY DETAILS
// ==========================================

function EmergencyDetails({
    emergency,
    getSeverityStyle,
    formatStatus,
    formatDate,
    onUpdated
}) {

    // ==========================================
    // DISPATCH STATE
    // ==========================================

    const [dispatch, setDispatch] =
        useState(null);

    const [availableUnits, setAvailableUnits] =
        useState([]);

    const [selectedUnitId, setSelectedUnitId] =
        useState("");

    const [loadingUnits, setLoadingUnits] =
        useState(false);

    const [loading, setLoading] =
        useState(false);


    // ==========================================
    // DEPARTMENT STATE
    // ==========================================

    const [selectedDepartment, setSelectedDepartment] =
        useState("");

    const [departmentLoading, setDepartmentLoading] =
        useState(false);


    // ==========================================
    // RESET WHEN EMERGENCY CHANGES
    // ==========================================

    useEffect(() => {
        setDispatch(null);

        setAvailableUnits([]);

        setSelectedUnitId("");

        setSelectedDepartment(
            emergency?.department &&
                emergency.department !== "pending"
                ? emergency.department
                : ""
        );
    }, [emergency?.emergency_id]);


    // ==========================================
    // FETCH EXISTING ACTIVE DISPATCH
    // ==========================================

    useEffect(() => {
        const fetchExistingDispatch = async () => {

            if (!emergency?.emergency_id) {
                return;
            }

            try {
                const response =
                    await getDispatchByEmergency(
                        emergency.emergency_id
                    );

                if (
                    response.success &&
                    response.data?.dispatch
                ) {
                    setDispatch(
                        response.data.dispatch
                    );
                } else {
                    setDispatch(null);
                }

            } catch (error) {

                // No active dispatch is an expected state.
                if (
                    !error.message
                        ?.toLowerCase()
                        .includes("no active dispatch")
                ) {
                    console.error(
                        "Failed to fetch existing dispatch:",
                        error
                    );
                }

                setDispatch(null);
            }
        };

        fetchExistingDispatch();

    }, [emergency?.emergency_id]);


    // ==========================================
    // FETCH AVAILABLE UNITS
    // ==========================================

    useEffect(() => {

        const fetchAvailableUnits = async () => {

            if (!emergency) {
                return;
            }

            if (
                !emergency.department ||
                emergency.department === "pending"
            ) {
                setAvailableUnits([]);
                return;
            }

            // Do not need available-unit list
            // while an active dispatch exists.
            if (dispatch) {
                setAvailableUnits([]);
                return;
            }

            try {
                setLoadingUnits(true);

                const response =
                    await getAvailableUnits(
                        emergency.department === "multi"
                            ? null
                            : emergency.department
                    );

                setAvailableUnits(
                    response.data || []
                );

            } catch (error) {

                console.error(
                    "Failed to fetch available units:",
                    error
                );

                setAvailableUnits([]);

            } finally {
                setLoadingUnits(false);
            }
        };

        fetchAvailableUnits();

    }, [
        emergency?.emergency_id,
        emergency?.department,
        dispatch
    ]);


    // ==========================================
    // ASSIGN DEPARTMENT
    // ==========================================

    const handleAssignDepartment = async () => {

        if (!selectedDepartment) {
            alert(
                "Please select a department first."
            );

            return;
        }

        try {

            setDepartmentLoading(true);

            await assignDepartment(
                emergency.emergency_id,
                selectedDepartment
            );

            // Load units for newly assigned department.
            setLoadingUnits(true);

            const response =
                await getAvailableUnits(
                    selectedDepartment === "multi"
                        ? null
                        : selectedDepartment
                );

            setAvailableUnits(
                response.data || []
            );

            setSelectedUnitId("");

            alert(
                `Department assigned successfully: ${selectedDepartment}`
            );

            onUpdated?.();

        } catch (error) {

            console.error(
                "Failed to assign department:",
                error
            );

            alert(error.message);

        } finally {

            setLoadingUnits(false);
            setDepartmentLoading(false);
        }
    };


    // ==========================================
    // START RESPONSE
    // ==========================================

    const handleStartResponse = async () => {

        try {

            setLoading(true);

            await updateEmergencyStatus(
                emergency.emergency_id,
                "in_progress"
            );

            onUpdated?.();

        } catch (error) {

            console.error(
                "Failed to start emergency:",
                error
            );

            alert(error.message);

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // MARK RESOLVED
    // ==========================================

    const handleResolve = async () => {

        try {

            setLoading(true);

            await updateEmergencyStatus(
                emergency.emergency_id,
                "resolved"
            );

            onUpdated?.();

        } catch (error) {

            console.error(
                "Failed to resolve emergency:",
                error
            );

            alert(error.message);

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // DISPATCH SELECTED UNIT
    // ==========================================

    const handleDispatch = async () => {

        if (!selectedUnitId) {

            alert(
                "Please select a response unit first."
            );

            return;
        }

        try {

            setLoading(true);

            const response =
                await dispatchUnit(
                    emergency.emergency_id,
                    selectedUnitId
                );

            if (
                !response.success ||
                !response.data?.dispatch
            ) {
                throw new Error(
                    "Dispatch was not created successfully."
                );
            }

            setDispatch(
                response.data.dispatch
            );

            // Remove dispatched unit locally.
            setAvailableUnits((units) =>
                units.filter(
                    (unit) =>
                        unit.unit_id !==
                        selectedUnitId
                )
            );

            setSelectedUnitId("");

            alert(
                "Unit dispatched successfully."
            );

            onUpdated?.();

        } catch (error) {

            console.error(
                "Failed to dispatch unit:",
                error
            );

            alert(error.message);

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // UPDATE DISPATCH STATUS
    // ==========================================

    const handleDispatchStatus = async (
        status
    ) => {

        if (!dispatch?._id) {

            alert(
                "No dispatch found."
            );

            return;
        }

        try {

            setLoading(true);

            const response =
                await updateDispatchStatus(
                    dispatch._id,
                    status
                );

            if (
                !response.success ||
                !response.data?.dispatch
            ) {
                throw new Error(
                    "Failed to update dispatch."
                );
            }

            const updatedDispatch =
                response.data.dispatch;

            // ==========================================
            // COMPLETED
            // ==========================================

            if (status === "completed") {

                setDispatch(
                    updatedDispatch
                );

                /*
                 * Keep the completed dispatch visible.
                 *
                 * The unit enters a 5-minute cooldown
                 * on the backend and must NOT immediately
                 * become available.
                 */

                onUpdated?.();

                return;
            }


            // ==========================================
            // CANCELLED
            // ==========================================

            if (status === "cancelled") {

                /*
                 * Backend puts the unit into BUSY state
                 * with a 5-minute cooldown.
                 *
                 * Therefore we reload available units.
                 * The cancelled unit should NOT appear
                 * until its cooldown expires.
                 */

                setDispatch(null);

                setSelectedUnitId("");

                try {

                    const units =
                        await getAvailableUnits(
                            emergency.department === "multi"
                                ? null
                                : emergency.department
                        );

                    setAvailableUnits(
                        units.data || []
                    );

                } catch (refreshError) {

                    console.error(
                        "Failed to refresh available units:",
                        refreshError
                    );

                    setAvailableUnits([]);
                }

                onUpdated?.();

                return;
            }


            // ==========================================
            // ACTIVE DISPATCH STATUS
            // ==========================================

            setDispatch(
                updatedDispatch
            );

            onUpdated?.();

        } catch (error) {

            console.error(
                "Failed to update dispatch status:",
                error
            );

            alert(error.message);

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // NO EMERGENCY SELECTED
    // ==========================================

    if (!emergency) {

        return (
            <div className="rounded-2xl bg-white p-6 shadow-sm">

                <div className="flex min-h-[250px] items-center justify-center text-center text-slate-400">

                    <div>

                        <AlertTriangle
                            size={45}
                            className="mx-auto mb-3 opacity-40"
                        />

                        <p>
                            Select an emergency
                            to view details
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    // ==========================================
    // MAIN UI
    // ==========================================

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm">

            {/* =================================
                HEADER
            ================================= */}

            <div className="mb-5 flex items-center gap-3 border-b border-slate-200 pb-4">

                <BarChart3
                    size={22}
                    className="text-red-600"
                />

                <h2 className="text-xl font-bold text-slate-800">
                    Emergency Details
                </h2>

            </div>


            {/* =================================
                BASIC INFORMATION
            ================================= */}

            <div className="mb-6 flex items-center justify-between">

                <div>

                    <p className="text-sm text-slate-500">
                        Emergency ID
                    </p>

                    <h3 className="text-xl font-bold text-slate-800">
                        {emergency.emergency_id}
                    </h3>

                </div>

                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getSeverityStyle(
                        emergency.severity
                    )}`}
                >
                    {emergency.severity.toUpperCase()}
                </span>

            </div>


            {/* =================================
                DETAILS
            ================================= */}

            <div className="grid gap-4 sm:grid-cols-2">

                <DetailItem
                    label="User"
                    value={emergency.user_name}
                />

                <DetailItem
                    label="Mobile"
                    value={emergency.mobile_number}
                />

                <DetailItem
                    label="Type"
                    value={emergency.emergency_type}
                />

                <DetailItem
                    label="Department"
                    value={
                        emergency.department ||
                        "Not assigned"
                    }
                />

                <DetailItem
                    label="Status"
                    value={formatStatus(
                        emergency.status
                    )}
                />

                <DetailItem
                    label="Created"
                    value={formatDate(
                        emergency.created_at
                    )}
                />

            </div>


            {/* =================================
                DESCRIPTION
            ================================= */}

            <div className="mt-5 rounded-xl bg-slate-50 p-4">

                <p className="mb-2 text-sm font-semibold text-slate-700">
                    Description
                </p>

                <p className="text-sm leading-6 text-slate-600">
                    {emergency.description}
                </p>

            </div>


            {/* =================================
                LOCATION INFORMATION
            ================================= */}

            <div className="mt-5 rounded-xl bg-slate-50 p-4">

                <div className="mb-2 flex items-center gap-2">

                    <MapPin
                        size={18}
                        className="text-red-600"
                    />

                    <p className="text-sm font-semibold text-slate-700">
                        User Location
                    </p>

                </div>

                <p className="text-sm text-slate-600">
                    {emergency.address ||
                        "Address unavailable"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                    Coordinates:{" "}
                    {emergency.location?.latitude ??
                        "N/A"}
                    ,{" "}
                    {emergency.location?.longitude ??
                        "N/A"}
                </p>

                {emergency.location?.accuracy && (
                    <p className="mt-1 text-xs text-slate-400">
                        GPS Accuracy:{" "}
                        {Math.round(
                            emergency.location.accuracy
                        )}{" "}
                        meters
                    </p>
                )}

            </div>


            {/* =================================
                ACTION BUTTONS
            ================================= */}

            <div className="mt-5 flex flex-wrap gap-3">

                {/* START RESPONSE */}

                {emergency.status === "pending" && (
                    <button
                        type="button"
                        disabled={loading}
                        onClick={
                            handleStartResponse
                        }
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Play size={16} />

                        {loading
                            ? "Starting..."
                            : "Start Response"}
                    </button>
                )}


                {/* MARK RESOLVED */}

                {emergency.status === "in_progress" && (
                    <button
                        type="button"
                        disabled={loading}
                        onClick={
                            handleResolve
                        }
                        className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Check size={16} />

                        {loading
                            ? "Updating..."
                            : "Mark Resolved"}
                    </button>
                )}

            </div>


            {/* =================================
                ASSIGN DEPARTMENT
            ================================= */}

            {!dispatch && (
                <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">

                    <div className="mb-4 flex items-center gap-2">

                        <Users
                            size={18}
                            className="text-blue-600"
                        />

                        <div>

                            <p className="font-semibold text-slate-800">
                                Assign Department
                            </p>

                            <p className="text-xs text-slate-500">
                                Select the department responsible for this emergency.
                            </p>

                        </div>

                    </div>


                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                        {/* POLICE */}

                        <button
                            type="button"
                            disabled={
                                departmentLoading
                            }
                            onClick={() =>
                                setSelectedDepartment(
                                    "police"
                                )
                            }
                            className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${selectedDepartment ===
                                    "police"
                                    ? "border-blue-600 bg-blue-100 text-blue-700 ring-2 ring-blue-200"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-400"
                                }`}
                        >
                            Police
                        </button>


                        {/* MEDICAL */}

                        <button
                            type="button"
                            disabled={
                                departmentLoading
                            }
                            onClick={() =>
                                setSelectedDepartment(
                                    "medical"
                                )
                            }
                            className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${selectedDepartment ===
                                    "medical"
                                    ? "border-blue-600 bg-blue-100 text-blue-700 ring-2 ring-blue-200"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-400"
                                }`}
                        >
                            Medical
                        </button>


                        {/* FIRE */}

                        <button
                            type="button"
                            disabled={
                                departmentLoading
                            }
                            onClick={() =>
                                setSelectedDepartment(
                                    "fire"
                                )
                            }
                            className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${selectedDepartment ===
                                    "fire"
                                    ? "border-blue-600 bg-blue-100 text-blue-700 ring-2 ring-blue-200"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-400"
                                }`}
                        >
                            Fire
                        </button>


                        {/* MULTI */}

                        <button
                            type="button"
                            disabled={
                                departmentLoading
                            }
                            onClick={() =>
                                setSelectedDepartment(
                                    "multi"
                                )
                            }
                            className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${selectedDepartment ===
                                    "multi"
                                    ? "border-blue-600 bg-blue-100 text-blue-700 ring-2 ring-blue-200"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-400"
                                }`}
                        >
                            Multi Department
                        </button>

                    </div>


                    {/* CURRENT / SELECTED DEPARTMENT */}

                    <div className="mt-4">

                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Selected Department
                        </p>

                        <p className="mt-1 text-sm font-semibold capitalize text-slate-700">
                            {selectedDepartment ||
                                "None selected"}
                        </p>

                    </div>


                    {/* ASSIGN BUTTON */}

                    <button
                        type="button"
                        disabled={
                            departmentLoading ||
                            !selectedDepartment
                        }
                        onClick={
                            handleAssignDepartment
                        }
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Users size={16} />

                        {departmentLoading
                            ? "Assigning Department..."
                            : selectedDepartment
                                ? `Assign ${selectedDepartment}`
                                : "Select Department First"}
                    </button>

                </div>
            )}


            {/* =================================
                ASSIGN / SELECT RESPONSE UNIT
            ================================= */}

            {!dispatch && (
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

                    <div className="mb-4 flex items-center gap-2">

                        <Ambulance
                            size={18}
                            className="text-orange-500"
                        />

                        <div>

                            <p className="font-semibold text-slate-800">
                                Assign Response Unit
                            </p>

                            <p className="text-xs text-slate-500">
                                Select an available unit for this emergency.
                            </p>

                        </div>

                    </div>


                    {/* NO DEPARTMENT */}

                    {(
                        !emergency.department ||
                        emergency.department === "pending"
                    ) && (
                            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">

                                <p className="text-sm font-medium text-yellow-800">
                                    Department must be assigned first.
                                </p>

                                <p className="mt-1 text-xs text-yellow-700">
                                    Assign a department before selecting a response unit.
                                </p>

                            </div>
                        )}


                    {/* LOADING UNITS */}

                    {emergency.department &&
                        emergency.department !== "pending" &&
                        loadingUnits && (
                            <div className="flex items-center gap-2 rounded-lg bg-white p-3 text-sm text-slate-500">

                                <Radio
                                    size={16}
                                    className="animate-pulse"
                                />

                                Loading available units...

                            </div>
                        )}


                    {/* NO AVAILABLE UNITS */}

                    {emergency.department &&
                        emergency.department !== "pending" &&
                        !loadingUnits &&
                        availableUnits.length === 0 && (
                            <div className="rounded-lg border border-slate-200 bg-white p-3">

                                <p className="text-sm font-medium text-slate-700">
                                    No available units.
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    There are currently no available response units for this department.
                                </p>

                            </div>
                        )}


                    {/* AVAILABLE UNITS */}

                    {!loadingUnits &&
                        availableUnits.length > 0 && (
                            <div>

                                <div className="grid gap-3">

                                    {availableUnits.map(
                                        (unit) => (
                                            <button
                                                key={
                                                    unit.unit_id
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setSelectedUnitId(
                                                        unit.unit_id
                                                    )
                                                }
                                                className={`w-full rounded-xl border p-4 text-left transition ${selectedUnitId ===
                                                        unit.unit_id
                                                        ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200"
                                                        : "border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/50"
                                                    }`}
                                            >

                                                <div className="flex items-center justify-between">

                                                    <div>

                                                        <p className="font-semibold text-slate-800">
                                                            {unit.unit_id}
                                                        </p>

                                                        <p className="mt-1 text-sm text-slate-500">
                                                            {unit.unit_name}
                                                        </p>

                                                    </div>

                                                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                                                        Available
                                                    </span>

                                                </div>


                                                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">

                                                    <div>
                                                        <span className="font-medium">
                                                            Type:
                                                        </span>{" "}
                                                        {unit.unit_type}
                                                    </div>

                                                    <div>
                                                        <span className="font-medium">
                                                            Department:
                                                        </span>{" "}
                                                        {unit.department}
                                                    </div>

                                                </div>

                                            </button>
                                        )
                                    )}

                                </div>


                                {/* DISPATCH SELECTED UNIT */}

                                <button
                                    type="button"
                                    disabled={
                                        loading ||
                                        !selectedUnitId
                                    }
                                    onClick={
                                        handleDispatch
                                    }
                                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    <Truck size={16} />

                                    {loading
                                        ? "Dispatching..."
                                        : selectedUnitId
                                            ? `Dispatch ${selectedUnitId}`
                                            : "Select a Unit First"}

                                </button>

                            </div>
                        )}

                </div>
            )}


            {/* =================================
                DISPATCH LIFECYCLE
            ================================= */}

            {dispatch && (
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

                    <div className="mb-4">

                        <p className="text-sm font-medium text-slate-500">
                            Dispatch ID
                        </p>

                        <p className="break-all font-semibold text-slate-800">
                            {dispatch._id}
                        </p>

                    </div>


                    <div className="mb-4">

                        <p className="text-sm font-medium text-slate-500">
                            Assigned Unit
                        </p>

                        <p className="font-semibold text-slate-800">
                            {dispatch.unit_id}
                        </p>

                    </div>


                    <div className="mb-4">

                        <p className="text-sm font-medium text-slate-500">
                            Current Status
                        </p>

                        <p className="font-semibold capitalize text-slate-800">
                            {dispatch.status.replace(
                                "_",
                                " "
                            )}
                        </p>

                    </div>


                    {/* =================================
                        LIFECYCLE
                    ================================= */}

                    <div className="mb-4 flex flex-wrap gap-2">

                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${dispatch.status ===
                                    "dispatched"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                        >
                            Dispatched
                        </span>


                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${dispatch.status ===
                                    "accepted"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                        >
                            Accepted
                        </span>


                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${dispatch.status ===
                                    "en_route"
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                        >
                            En Route
                        </span>


                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${dispatch.status ===
                                    "arrived"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                        >
                            Arrived
                        </span>


                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${dispatch.status ===
                                    "completed"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                        >
                            Completed
                        </span>


                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${dispatch.status ===
                                    "cancelled"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                        >
                            Cancelled
                        </span>

                    </div>


                    {/* =================================
                        NEXT LIFECYCLE ACTION
                    ================================= */}

                    <div className="flex flex-wrap gap-2">

                        {dispatch.status ===
                            "dispatched" && (
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() =>
                                        handleDispatchStatus(
                                            "accepted"
                                        )
                                    }
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    Accept Dispatch
                                </button>
                            )}


                        {dispatch.status ===
                            "accepted" && (
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() =>
                                        handleDispatchStatus(
                                            "en_route"
                                        )
                                    }
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    Mark En Route
                                </button>
                            )}


                        {dispatch.status ===
                            "en_route" && (
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() =>
                                        handleDispatchStatus(
                                            "arrived"
                                        )
                                    }
                                    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                                >
                                    Mark Arrived
                                </button>
                            )}


                        {dispatch.status ===
                            "arrived" && (
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() =>
                                        handleDispatchStatus(
                                            "completed"
                                        )
                                    }
                                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                    Complete Response
                                </button>
                            )}


                        {(
                            dispatch.status ===
                            "dispatched" ||
                            dispatch.status ===
                            "accepted" ||
                            dispatch.status ===
                            "en_route"
                        ) && (
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() =>
                                        handleDispatchStatus(
                                            "cancelled"
                                        )
                                    }
                                    className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                                >
                                    Cancel Dispatch
                                </button>
                            )}

                    </div>


                    {/* =================================
                        COOLDOWN INFORMATION
                    ================================= */}

                    {(
                        dispatch.status ===
                        "completed" ||
                        dispatch.status ===
                        "cancelled"
                    ) && (
                            <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">

                                <p className="text-sm font-semibold text-yellow-800">
                                    Response unit is in cooldown
                                </p>

                                <p className="mt-1 text-xs text-yellow-700">
                                    The unit will become available
                                    automatically after the 5-minute
                                    cooldown period.
                                </p>

                            </div>
                        )}

                </div>
            )}


            {/* =================================
                REAL LEAFLET MAP
            ================================= */}

            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">

                <div className="border-b border-slate-200 bg-white px-4 py-3">

                    <div className="flex items-center gap-2">

                        <MapPin
                            size={18}
                            className="text-red-600"
                        />

                        <div>

                            <p className="font-semibold text-slate-800">
                                User's Emergency Location
                            </p>

                            <p className="text-xs text-slate-500">
                                Live map position from emergency request
                            </p>

                        </div>

                    </div>

                </div>

                <EmergencyLocationMap
                    emergency={emergency}
                />

            </div>

        </div>
    );
}

export default EmergencyDetails;