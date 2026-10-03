import { ArrowLeft, Cross } from "lucide-react";
import { Link } from "react-router-dom";

function EmergencyHeader() {
    return (
        <header className="bg-red-600 px-6 py-8 text-center text-white shadow-lg">

            <Link
                to="/"
                className="mb-4 inline-flex items-center gap-2 text-sm text-red-100 transition hover:text-white"
            >
                <ArrowLeft size={18} />
                Back to QuickAid
            </Link>

            <div className="flex justify-center">
                <div className="rounded-2xl bg-white/10 p-4">
                    <Cross size={45} />
                </div>
            </div>

            <h1 className="mt-4 text-3xl font-bold">
                QuickAid
            </h1>

            <p className="mt-2 text-red-100">
                AI-Powered Emergency Response & Assistance
            </p>

        </header>
    );
}

export default EmergencyHeader;