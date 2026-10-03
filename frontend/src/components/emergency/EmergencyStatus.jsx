import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

function EmergencyStatus({ locationText }) {
    return (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-white p-4 shadow">

            <span className="h-3 w-3 animate-pulse rounded-full bg-green-500" />

            <span className="text-sm text-slate-700">
                {locationText}
            </span>

        </div>
    );
}

export default EmergencyStatus;