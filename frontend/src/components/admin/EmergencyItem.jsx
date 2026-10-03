import {
    Play,
    Check,
    MapPin,
    Ambulance
} from "lucide-react";

import { updateEmergencyStatus } from "../../api/emergency.api";

function EmergencyItem({
    emergency,
    onSelect,
    onUpdated
}) {

    // ==========================================
    // START EMERGENCY
    // ==========================================

    const handleStart = async (e) => {
        e.stopPropagation();

        try {
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

            alert(
                error.message ||
                "Failed to start emergency."
            );
        }
    };


    // ==========================================
    // RESOLVE EMERGENCY
    // ==========================================

    const handleResolve = async (e) => {
        e.stopPropagation();

        try {
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

            alert(
                error.message ||
                "Failed to resolve emergency."
            );
        }
    };


    // ==========================================
    // LOCATION
    // ==========================================

    const handleLocation = (e) => {
        e.stopPropagation();

        onSelect?.(emergency);
    };


    // ==========================================
    // DISPATCH
    // ==========================================

    const handleDispatch = (e) => {
        e.stopPropagation();

        onSelect?.(emergency);
    };


    // ==========================================
    // ACTIVE DISPATCH CHECK
    // ==========================================

    /*
        EmergencyItem receives the emergency object
        from the emergency list.

        assigned_units only tells us which units
        have been assigned historically/currently.

        The actual active dispatch is managed by
        EmergencyDetails.jsx.

        Therefore Dispatch opens the details panel,
        where the current dispatch is checked before
        allowing another dispatch.
    */

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div
            onClick={() =>
                onSelect?.(emergency)
            }
            className="rounded-xl border border-slate-200 border-l-4 bg-white p-5 shadow-sm transition hover:shadow-md"
        >

            {/* ==================================
                HEADER
            ================================== */}

            <div className="flex items-start justify-between gap-4">

                <div className="min-w-0">

                    <h3 className="truncate font-bold text-slate-900">
                        {emergency.emergency_id}
                    </h3>

                    <p className="mt-1 text-sm capitalize text-slate-500">
                        {emergency.emergency_type}
                    </p>

                </div>


                {/* SEVERITY */}

                <span
                    className={`
                        shrink-0
                        rounded-full
                        px-3
                        py-1
                        text-xs
                        font-semibold
                        capitalize
                        ${emergency.severity === "critical"
                            ? "bg-red-100 text-red-700"
                            : emergency.severity === "high"
                                ? "bg-orange-100 text-orange-700"
                                : emergency.severity === "medium"
                                    ? "bg-cyan-100 text-cyan-700"
                                    : "bg-green-100 text-green-700"
                        }
                    `}
                >
                    {emergency.severity}
                </span>

            </div>


            {/* ==================================
                INFORMATION
            ================================== */}

            <div className="mt-4 space-y-2 text-sm">

                <p>
                    <span className="font-semibold text-slate-700">
                        User:
                    </span>{" "}
                    <span className="text-slate-600">
                        {emergency.user_name || "N/A"}
                    </span>
                </p>


                <p>
                    <span className="font-semibold text-slate-700">
                        Mobile:
                    </span>{" "}
                    <span className="text-slate-600">
                        {emergency.mobile_number || "N/A"}
                    </span>
                </p>


                <p className="line-clamp-2 text-slate-600">
                    {emergency.description ||
                        "No description provided."}
                </p>

            </div>


            {/* ==================================
                DEPARTMENT
            ================================== */}

            <div className="mt-3">

                <span className="text-xs font-medium text-slate-500">
                    Department:
                </span>{" "}

                <span className="text-xs font-semibold capitalize text-slate-700">
                    {emergency.department ||
                        "pending"}
                </span>

            </div>


            {/* ==================================
                STATUS
            ================================== */}

            <div className="mt-4">

                <span
                    className={`
                        inline-flex
                        rounded-full
                        px-3
                        py-1
                        text-xs
                        font-semibold
                        capitalize
                        ${emergency.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : emergency.status === "in_progress"
                                ? "bg-blue-100 text-blue-700"
                                : emergency.status === "resolved"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-slate-100 text-slate-600"
                        }
                    `}
                >
                    {emergency.status
                        ? emergency.status.replace(
                            "_",
                            " "
                        )
                        : "unknown"}
                </span>

            </div>


            {/* ==================================
                ACTIONS
            ================================== */}

            <div className="mt-5 flex flex-wrap gap-2">

                {/* ==================================
                    START
                ================================== */}

                {emergency.status === "pending" && (

                    <button
                        type="button"
                        onClick={handleStart}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >

                        <Play size={16} />

                        Start

                    </button>

                )}


                {/* ==================================
                    RESOLVE

                    Only displayed for an
                    in-progress emergency.

                    EmergencyDetails handles the
                    active-dispatch state and backend
                    prevents resolving while a dispatch
                    is active.
                ================================== */}

                {emergency.status === "in_progress" && (

                    <button
                        type="button"
                        onClick={handleResolve}
                        className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                    >

                        <Check size={16} />

                        Resolve

                    </button>

                )}


                {/* ==================================
                    LOCATION
                ================================== */}

                <button
                    type="button"
                    onClick={handleLocation}
                    className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                >

                    <MapPin size={16} />

                    Location

                </button>


                {/* ==================================
                    DISPATCH

                    This does NOT dispatch directly.

                    It opens EmergencyDetails.jsx,
                    where the admin can:
                    1. Select an available unit
                    2. Dispatch it
                    3. Track its lifecycle
                ================================== */}

                {emergency.status !== "resolved" &&
                    emergency.status !== "cancelled" && (

                        <button
                            type="button"
                            onClick={handleDispatch}
                            className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                        >

                            <Ambulance size={16} />

                            Dispatch

                        </button>

                    )}

            </div>

        </div>
    );
}

export default EmergencyItem;