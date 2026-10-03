function EmergencyCategories({
    selectedCategory,
    selectEmergencyCategory
}) {
    const categories = [
        ["heart_attack", "Heart Attack"],
        ["stroke", "Stroke"],
        ["bleeding", "Severe Bleeding"],
        ["allergy", "Allergic Reaction"],
        ["poisoning", "Poisoning"],
        ["burn", "Burn Injury"],
        ["drowning", "Drowning"],
        ["choking", "Choking"]
    ];

    return (
        <div className="mt-6">

            <h3 className="mb-3 font-semibold">
                Emergency Categories
            </h3>

            <div className="grid grid-cols-2 gap-2">

                {categories.map(
                    ([code, label]) => (
                        <button
                            key={code}
                            onClick={() =>
                                selectEmergencyCategory(
                                    code
                                )
                            }
                            className={`rounded-lg border p-3 text-sm ${selectedCategory === code
                                    ? "border-red-500 bg-red-50"
                                    : "hover:bg-slate-50"
                                }`}
                        >
                            {label}
                        </button>
                    )
                )}

            </div>

        </div>
    );
}

export default EmergencyCategories;