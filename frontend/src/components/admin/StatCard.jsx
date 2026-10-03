function StatCard({
    title,
    value,
    icon,
    iconStyle,
    borderStyle
}) {
    return (
        <div
            className={`
                rounded-2xl
                border-l-4
                bg-white
                p-5
                shadow-sm
                transition
                hover:-translate-y-1
                hover:shadow-md
                ${borderStyle || ""}
            `}
        >

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <h3 className="mt-2 text-3xl font-bold text-slate-800">
                        {value}
                    </h3>

                </div>


                <div
                    className={`
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-xl
                        ${iconStyle || ""}
                    `}
                >
                    {icon}
                </div>

            </div>

        </div>
    );
}

export default StatCard;