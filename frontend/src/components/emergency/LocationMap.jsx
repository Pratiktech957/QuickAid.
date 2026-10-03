import {
    CheckCircle,
    Cross,
    Hospital,
    MapPinned,
    Navigation,
    Shield
} from "lucide-react";

function LocationMap({
    locationText,
    mapContainerRef,
    centerMapOnUser,
    clearRoute,
    searchNearbyServices,
    nearbyServices,
    showRoute
}) {
    return (
        <section className="rounded-2xl bg-white p-6 shadow">

            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="mb-5 flex items-center gap-3">

                <MapPinned
                    className="text-blue-600"
                    size={28}
                />

                <h2 className="text-xl font-bold text-slate-900">
                    Your Location
                </h2>

            </div>


            {/* ==========================================
                LOCATION STATUS
            ========================================== */}

            <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-100 p-4">

                <CheckCircle
                    className="shrink-0 text-green-600"
                    size={20}
                />

                <span className="text-sm text-slate-700">
                    {locationText || "Location unavailable"}
                </span>

            </div>


            {/* ==========================================
                MAP
            ========================================== */}

            <div
                ref={mapContainerRef}
                className="h-[400px] w-full rounded-xl overflow-hidden"
            />


            {/* ==========================================
                MAP CONTROLS
            ========================================== */}

            <div className="mt-4 flex flex-wrap gap-2">

                <button
                    type="button"
                    onClick={centerMapOnUser}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >

                    <Navigation size={18} />

                    My Location

                </button>


                <button
                    type="button"
                    onClick={clearRoute}
                    className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >

                    Clear Route

                </button>

            </div>


            {/* ==========================================
                NEARBY SERVICES
            ========================================== */}

            <div className="mt-5">

                <p className="mb-3 text-sm font-semibold text-slate-800">
                    Find Nearby Services
                </p>


                <div className="grid grid-cols-3 gap-2">

                    {/* HOSPITAL */}

                    <button
                        type="button"
                        onClick={() =>
                            searchNearbyServices(
                                "hospital"
                            )
                        }
                        className="rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >

                        <Hospital
                            className="mx-auto mb-1 text-red-600"
                            size={20}
                        />

                        Hospital

                    </button>


                    {/* POLICE */}

                    <button
                        type="button"
                        onClick={() =>
                            searchNearbyServices(
                                "police"
                            )
                        }
                        className="rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >

                        <Shield
                            className="mx-auto mb-1 text-blue-600"
                            size={20}
                        />

                        Police

                    </button>


                    {/* PHARMACY */}

                    <button
                        type="button"
                        onClick={() =>
                            searchNearbyServices(
                                "pharmacy"
                            )
                        }
                        className="rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >

                        <Cross
                            className="mx-auto mb-1 text-green-600"
                            size={20}
                        />

                        Pharmacy

                    </button>

                </div>

            </div>


            {/* ==========================================
                NEARBY SERVICE RESULTS
            ========================================== */}

            {nearbyServices &&
                nearbyServices.length > 0 && (

                    <div className="mt-5 space-y-3">

                        <div className="flex items-center justify-between">

                            <p className="text-sm font-semibold text-slate-800">
                                Nearby Results
                            </p>

                            <span className="text-xs text-slate-500">
                                {nearbyServices.length} found
                            </span>

                        </div>


                        {nearbyServices.map(
                            (place, index) => (

                                <div
                                    key={
                                        place.place_id ||
                                        place.osm_id ||
                                        index
                                    }
                                    className="rounded-xl border border-slate-200 p-4"
                                >

                                    {/* PLACE NAME */}

                                    <p className="font-semibold text-slate-900">

                                        {place.display_name
                                            ? place.display_name.split(
                                                ","
                                            )[0]
                                            : "Nearby service"}

                                    </p>


                                    {/* ADDRESS */}

                                    {place.display_name && (

                                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">

                                            {
                                                place.display_name
                                            }

                                        </p>

                                    )}


                                    {/* DISTANCE */}

                                    {place.distance !==
                                        undefined && (

                                            <p className="mt-2 text-sm text-slate-500">

                                                Distance:{" "}

                                                {Number(
                                                    place.distance
                                                ).toFixed(1)}{" "}

                                                km

                                            </p>

                                        )}


                                    {/* SHOW ROUTE */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            showRoute(
                                                place
                                            )
                                        }
                                        className="mt-3 flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                                    >

                                        <Navigation
                                            size={16}
                                        />

                                        Show Route

                                    </button>

                                </div>

                            )
                        )}

                    </div>

                )}

        </section>
    );
}

export default LocationMap;