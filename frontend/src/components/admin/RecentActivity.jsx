import { Bell } from "lucide-react";

function RecentActivity({
    emergencies = [],
    formatDate
}) {
    return (
        <div className="mt-6">

            {/* ==================================
                TITLE
            ================================== */}

            <h3 className="mb-4 font-semibold text-slate-700">
                Recent Activity
            </h3>


            {/* ==================================
                ACTIVITY LIST
            ================================== */}

            {emergencies.length === 0 ? (

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">

                    <Bell
                        size={24}
                        className="mx-auto text-slate-300"
                    />

                    <p className="mt-2 text-sm font-medium text-slate-600">
                        No recent activity
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        Emergency reports will appear here.
                    </p>

                </div>

            ) : (

                <div className="space-y-3">

                    {emergencies
                        .slice(0, 5)
                        .map((emergency) => (

                            <div
                                key={
                                    emergency.emergency_id
                                }
                                className="rounded-lg border-l-4 border-blue-500 bg-slate-50 p-4"
                            >

                                <div className="flex items-start gap-3">

                                    <Bell
                                        size={18}
                                        className="mt-0.5 shrink-0 text-blue-600"
                                    />


                                    <div className="min-w-0">

                                        {/* EMERGENCY */}

                                        <p className="font-semibold capitalize text-slate-700">

                                            {
                                                emergency.emergency_type ||
                                                "Emergency"
                                            }

                                            {" - "}

                                            {
                                                emergency.emergency_id ||
                                                "N/A"
                                            }

                                        </p>


                                        {/* DESCRIPTION */}

                                        <p className="mt-1 break-words text-sm text-slate-500">

                                            {
                                                emergency.description ||
                                                "No description provided."
                                            }

                                        </p>


                                        {/* DATE */}

                                        <p className="mt-1 text-xs text-slate-400">

                                            {typeof formatDate ===
                                                "function"
                                                ? formatDate(
                                                    emergency.created_at
                                                )
                                                : "N/A"}

                                        </p>

                                    </div>

                                </div>

                            </div>

                        ))}

                </div>

            )}

        </div>
    );
}

export default RecentActivity;