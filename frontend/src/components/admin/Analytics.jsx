import {
    Activity,
    BarChart3
} from "lucide-react";

function Analytics({ analytics }) {

    const byType = analytics?.byType || [];
    const byHour = analytics?.byHour || [];
    const byStatus = analytics?.byStatus || [];


    return (
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-4">

                <Activity
                    size={22}
                    className="text-red-600"
                />

                <h2 className="text-xl font-bold text-slate-800">
                    Analytics & Reports
                </h2>

            </div>


            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">


                {/* =================================
                    EMERGENCIES BY TYPE
                ================================= */}

                <div className="rounded-xl border border-slate-200 p-5">

                    <h3 className="mb-5 font-semibold text-slate-700">
                        Emergencies by Type
                    </h3>

                    <div className="space-y-3">

                        {byType.length === 0 ? (

                            <div className="flex h-64 items-center justify-center rounded-lg bg-slate-50">

                                <p className="text-slate-400">
                                    No emergency data available
                                </p>

                            </div>

                        ) : (

                            byType.map((item) => (

                                <div
                                    key={item._id}
                                    className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                                >

                                    <span className="capitalize text-slate-700">
                                        {item._id}
                                    </span>

                                    <span className="font-bold text-red-600">
                                        {item.count}
                                    </span>

                                </div>

                            ))

                        )}

                    </div>

                </div>


                {/* =================================
                    EMERGENCIES BY HOUR
                ================================= */}

                <div className="rounded-xl border border-slate-200 p-5">

                    <h3 className="mb-5 font-semibold text-slate-700">
                        Emergencies by Hour
                    </h3>

                    <div className="space-y-2">

                        {byHour.length === 0 ? (

                            <div className="flex h-64 items-center justify-center rounded-lg bg-slate-50">

                                <p className="text-slate-400">
                                    No hourly data available
                                </p>

                            </div>

                        ) : (

                            byHour.map((item) => (

                                <div
                                    key={item._id}
                                    className="flex items-center justify-between rounded-lg bg-slate-50 p-2"
                                >

                                    <span className="text-sm text-slate-600">
                                        {item._id}:00
                                    </span>

                                    <span className="font-semibold text-blue-600">
                                        {item.count}
                                    </span>

                                </div>

                            ))

                        )}

                    </div>

                </div>


                {/* =================================
                    EMERGENCIES BY STATUS
                ================================= */}

                <div className="rounded-xl border border-slate-200 p-5 lg:col-span-2">

                    <h3 className="mb-5 font-semibold text-slate-700">
                        Emergencies by Status
                    </h3>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

                        {byStatus.length === 0 ? (

                            <div className="col-span-full flex h-32 items-center justify-center rounded-lg bg-slate-50">

                                <p className="text-slate-400">
                                    No status data available
                                </p>

                            </div>

                        ) : (

                            byStatus.map((item) => (

                                <div
                                    key={item._id}
                                    className="rounded-xl bg-slate-50 p-4 text-center"
                                >

                                    <p className="capitalize text-sm text-slate-500">
                                        {item._id.replace("_", " ")}
                                    </p>

                                    <p className="mt-1 text-2xl font-bold text-slate-800">
                                        {item.count}
                                    </p>

                                </div>

                            ))

                        )}

                    </div>

                </div>

            </div>

        </section>
    );
}

export default Analytics;