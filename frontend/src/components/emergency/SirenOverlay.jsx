import { Siren } from "lucide-react";

function SirenOverlay({
    showSiren,
    setShowSiren
}) {
    if (!showSiren) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-red-600/90 px-6 text-center text-white">

            <Siren
                size={90}
                className="mb-6 animate-pulse"
            />

            <h2 className="text-4xl font-bold">
                EMERGENCY RESPONSE ACTIVATED
            </h2>

            <p className="mt-4 text-lg">
                Please stay calm.
            </p>

            <button
                type="button"
                onClick={() => setShowSiren(false)}
                className="mt-8 rounded-xl bg-white px-6 py-3 font-semibold text-red-600"
            >
                Close Alert
            </button>

        </div>
    );
}

export default SirenOverlay;