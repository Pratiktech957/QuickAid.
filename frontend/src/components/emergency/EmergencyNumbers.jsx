import {
    Ambulance,
    Flame,
    Shield
} from "lucide-react";

function EmergencyNumbers() {
    return (
        <section className="mt-6 grid gap-4 md:grid-cols-3">

            <a
                href="tel:100"
                className="flex items-center justify-center gap-3 rounded-xl bg-blue-600 p-5 font-semibold text-white"
            >
                <Shield size={22} />
                Police — 100
            </a>

            <a
                href="tel:108"
                className="flex items-center justify-center gap-3 rounded-xl bg-red-600 p-5 font-semibold text-white"
            >
                <Ambulance size={22} />
                Ambulance — 108
            </a>

            <a
                href="tel:101"
                className="flex items-center justify-center gap-3 rounded-xl bg-orange-500 p-5 font-semibold text-white"
            >
                <Flame size={22} />
                Fire — 101
            </a>

        </section>
    );
}

export default EmergencyNumbers;