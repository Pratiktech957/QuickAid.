import { List, Search } from "lucide-react";
import { useMemo, useState } from "react";

import EmergencyItem from "./EmergencyItem";

function EmergencyList({
    emergencies,
    currentFilter,
    setCurrentFilter,
    setSelectedEmergency,
    getEmergencyBorder,
    getStatusStyle,
    getSeverityStyle,
    formatStatus,
    formatDate,
    onUpdated
}) {
    const [searchQuery, setSearchQuery] = useState("");

    // ==========================================
    // FILTER + SEARCH
    // ==========================================

    const filteredEmergencies = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return emergencies.filter((emergency) => {

            // ==========================================
            // STATUS / SEVERITY FILTER
            // ==========================================

            if (currentFilter === "critical") {
                if (emergency.severity !== "critical") {
                    return false;
                }
            } else if (currentFilter !== "all") {
                if (emergency.status !== currentFilter) {
                    return false;
                }
            }

            // ==========================================
            // SEARCH
            // ==========================================

            if (!query) {
                return true;
            }

            const searchableFields = [
                emergency.emergency_id,
                emergency.user_name,
                emergency.mobile_number,
                emergency.emergency_type,
                emergency.description,
                emergency.department,
                emergency.status,
                emergency.severity
            ];

            return searchableFields.some((field) =>
                String(field || "")
                    .toLowerCase()
                    .includes(query)
            );
        });
    }, [
        emergencies,
        currentFilter,
        searchQuery
    ]);

    // ==========================================
    // FILTER ITEMS
    // ==========================================

    const filterItems = [
        {
            value: "all",
            label: "All"
        },
        {
            value: "pending",
            label: "Pending"
        },
        {
            value: "in_progress",
            label: "In Progress"
        },
        {
            value: "resolved",
            label: "Resolved"
        },
        {
            value: "critical",
            label: "Critical"
        }
    ];

    // ==========================================
    // CLEAR SEARCH
    // ==========================================

    const handleFilterChange = (filter) => {
        setCurrentFilter(filter);
    };

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* ==================================
                HEADER
            ================================== */}

            <div className="border-b border-slate-200 p-5">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <List size={21} />
                        </div>

                        <div>

                            <h2 className="text-lg font-bold text-slate-900">
                                Emergency Reports
                            </h2>

                            <p className="text-sm text-slate-500">
                                {filteredEmergencies.length}{" "}
                                {filteredEmergencies.length === 1
                                    ? "emergency"
                                    : "emergencies"}
                            </p>

                        </div>

                    </div>

                </div>

                {/* ==================================
                    SEARCH
                ================================== */}

                <div className="relative mt-4">

                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(event) =>
                            setSearchQuery(event.target.value)
                        }
                        placeholder="Search emergency ID, name, type, department..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                    />

                </div>

            </div>


            {/* ==================================
                FILTERS
            ================================== */}

            <div className="border-b border-slate-200 px-5 py-4">

                <div className="flex flex-wrap gap-2">

                    {filterItems.map((filter) => {

                        const active =
                            currentFilter === filter.value;

                        return (
                            <button
                                key={filter.value}
                                type="button"
                                onClick={() =>
                                    handleFilterChange(
                                        filter.value
                                    )
                                }
                                className={`
                                    rounded-full px-4 py-2
                                    text-sm font-medium
                                    transition
                                    ${active
                                        ? "bg-slate-900 text-white shadow-sm"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }
                                `}
                            >
                                {filter.label}
                            </button>
                        );
                    })}

                </div>

            </div>


            {/* ==================================
                EMERGENCY LIST
            ================================== */}

            <div className="max-h-[650px] space-y-3 overflow-y-auto p-5">

                {filteredEmergencies.length === 0 ? (

                    <div className="flex min-h-[250px] items-center justify-center">

                        <div className="text-center">

                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">

                                <List
                                    size={22}
                                    className="text-slate-400"
                                />

                            </div>

                            <h3 className="mt-4 font-semibold text-slate-800">
                                No emergencies found
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Try changing your filter
                                or search query.
                            </p>

                        </div>

                    </div>

                ) : (

                    filteredEmergencies.map((emergency) => (

                        <EmergencyItem
                            key={emergency.emergency_id}

                            emergency={emergency}

                            borderStyle={
                                getEmergencyBorder(
                                    emergency
                                )
                            }

                            statusStyle={
                                getStatusStyle(
                                    emergency.status
                                )
                            }

                            severityStyle={
                                getSeverityStyle(
                                    emergency.severity
                                )
                            }

                            formatStatus={
                                formatStatus
                            }

                            formatDate={
                                formatDate
                            }

                            onSelect={() =>
                                setSelectedEmergency(
                                    emergency
                                )
                            }

                            onUpdated={
                                onUpdated
                            }
                        />

                    ))

                )}

            </div>

        </div>
    );
}

export default EmergencyList;