import { Send, X } from "lucide-react";

function EmergencyUserModal({
    showUserModal,
    setShowUserModal,
    userName,
    setUserName,
    userMobile,
    setUserMobile,
    submitEmergency,
    loading
}) {
    if (!showUserModal) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/60 px-4">

            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

                {/* Header */}

                <div className="mb-6 flex items-center justify-between">

                    <div>
                        <h2 className="text-xl font-bold">
                            Emergency Contact Information
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Required to send your emergency request.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setShowUserModal(false)
                        }
                        className="rounded-lg p-1 hover:bg-slate-100"
                    >
                        <X />
                    </button>

                </div>


                {/* Name */}

                <input
                    type="text"
                    value={userName}
                    onChange={(e) =>
                        setUserName(e.target.value)
                    }
                    placeholder="Full name"
                    className="mb-4 w-full rounded-xl border p-3 outline-none focus:border-red-500"
                />


                {/* Mobile */}

                <input
                    type="tel"
                    value={userMobile}
                    onChange={(e) =>
                        setUserMobile(e.target.value)
                    }
                    placeholder="Mobile number"
                    className="mb-5 w-full rounded-xl border p-3 outline-none focus:border-red-500"
                />


                {/* Actions */}

                <div className="flex gap-3">

                    <button
                        type="button"
                        onClick={submitEmergency}
                        disabled={loading}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-semibold text-white disabled:opacity-60"
                    >
                        <Send size={18} />

                        {loading
                            ? "Submitting..."
                            : "Submit Emergency"}
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setShowUserModal(false)
                        }
                        className="flex-1 rounded-xl bg-slate-200 py-3 font-semibold text-slate-700"
                    >
                        Cancel
                    </button>

                </div>

            </div>

        </div>
    );
}

export default EmergencyUserModal;