import { MapPinned, Navigation, X } from "lucide-react";

function RouteInfo({
    routeInfo,
    clearRoute
}) {
    if (!routeInfo) {
        return null;
    }

    return (
        <section className="mt-6 rounded-2xl bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Navigation
                        className="text-blue-600"
                        size={26}
                    />

                    <div>
                        <h2 className="text-xl font-bold">
                            Route Information
                        </h2>

                        <p className="text-sm text-slate-500">
                            Navigation to selected emergency service
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={clearRoute}
                    className="rounded-lg p-2 hover:bg-slate-100"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                    <MapPinned
                        className="mt-1 text-red-600"
                        size={22}
                    />

                    <div>
                        <p className="font-semibold">
                            {routeInfo.name}
                        </p>

                        {routeInfo.distance !== undefined && (
                            <p className="mt-1 text-sm text-slate-500">
                                Distance: {routeInfo.distance.toFixed(1)} km
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default RouteInfo;