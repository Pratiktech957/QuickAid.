import {
    Ambulance,
    MapPin
} from "lucide-react";

function ResponseUnits({
    responseUnits = []
}) {
    return (
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

            {/* ==================================
                HEADER
            ================================== */}

            <div className="mb-5 flex items-center gap-3 border-b border-slate-200 pb-4">

                <Ambulance
                    size={22}
                    className="text-red-600"
                />

                <h2 className="text-xl font-bold text-slate-800">
                    Response Units
                </h2>

            </div>


            {/* ==================================
                EMPTY STATE
            ================================== */}

            {responseUnits.length === 0 ? (

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">

                    <Ambulance
                        size={30}
                        className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-semibold text-slate-600">
                        No response units available
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                        Registered response units will appear here.
                    </p>

                </div>

            ) : (

                /* ==================================
                   RESPONSE UNIT GRID
                ================================== */

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    {responseUnits.map((unit) => (

                        <div
                            key={unit.unit_id}
                            className="rounded-xl border border-slate-200 p-5 transition hover:-translate-y-1 hover:shadow-md"
                        >

                            {/* UNIT NAME + STATUS */}

                            <div className="mb-3 flex items-center justify-between gap-3">

                                <h3 className="truncate font-bold text-slate-800">
                                    {unit.unit_name || "Unnamed Unit"}
                                </h3>

                                <span
                                    className={`
                                        shrink-0
                                        rounded-full
                                        px-3
                                        py-1
                                        text-xs
                                        font-semibold
                                        ${unit.status === "available"
                                            ? "bg-green-100 text-green-700"
                                            : unit.status === "busy"
                                                ? "bg-amber-100 text-amber-700"
                                                : unit.status === "dispatched"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-red-100 text-red-700"
                                        }
                                    `}
                                >
                                    {unit.status
                                        ? unit.status.toUpperCase()
                                        : "UNKNOWN"}
                                </span>

                            </div>


                            {/* UNIT TYPE */}

                            <p className="text-sm capitalize text-slate-500">
                                {unit.unit_type || "Unknown type"}
                            </p>


                            {/* DEPARTMENT */}

                            <p className="mt-1 text-sm capitalize text-slate-500">
                                {unit.department || "Unknown department"}
                            </p>


                            {/* UNIT ID */}

                            <p className="mt-1 text-xs text-slate-400">
                                ID: {unit.unit_id || "N/A"}
                            </p>


                            {/* TRACK BUTTON */}

                            <button
                                type="button"
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                <MapPin size={16} />
                                Track Unit
                            </button>

                        </div>

                    ))}

                </div>

            )}

        </section>
    );
}

export default ResponseUnits;