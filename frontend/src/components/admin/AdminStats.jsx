import {
    Activity,
    Clock3,
    CheckCircle2,
    AlertTriangle
} from "lucide-react";

import StatCard from "./StatCard";

function AdminStats({
    totalEmergencies,
    pendingEmergencies,
    inProgressEmergencies,
    resolvedEmergencies,
    criticalEmergencies
}) {
    return (
        <section className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">

            {/* ==================================
                TOTAL
            ================================== */}

            <StatCard
                title="Total Emergencies"
                value={totalEmergencies}
                icon={<Activity size={22} />}
                iconStyle="bg-blue-100 text-blue-600"
                borderStyle="border-l-blue-500"
            />


            {/* ==================================
                PENDING
            ================================== */}

            <StatCard
                title="Pending"
                value={pendingEmergencies}
                icon={<Clock3 size={22} />}
                iconStyle="bg-amber-100 text-amber-600"
                borderStyle="border-l-amber-500"
            />


            {/* ==================================
                IN PROGRESS
            ================================== */}

            <StatCard
                title="In Progress"
                value={inProgressEmergencies}
                icon={<Activity size={22} />}
                iconStyle="bg-blue-100 text-blue-600"
                borderStyle="border-l-blue-500"
            />


            {/* ==================================
                RESOLVED
            ================================== */}

            <StatCard
                title="Resolved"
                value={resolvedEmergencies}
                icon={<CheckCircle2 size={22} />}
                iconStyle="bg-green-100 text-green-600"
                borderStyle="border-l-green-500"
            />


            {/* ==================================
                CRITICAL
            ================================== */}

            <StatCard
                title="Critical"
                value={criticalEmergencies}
                icon={<AlertTriangle size={22} />}
                iconStyle="bg-red-100 text-red-600"
                borderStyle="border-l-red-500"
            />

        </section>
    );
}

export default AdminStats;