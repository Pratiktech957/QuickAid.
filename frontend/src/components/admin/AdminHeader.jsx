import {
    ShieldCheck,
    RefreshCw,
    Users,
    LogOut
} from "lucide-react";

function AdminHeader({
    admin,
    onRefresh,
    onLogout,
    refreshing = false
}) {
    return (
        <header className="border-b border-slate-200 bg-white">

            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">

                {/* ==================================
                    BRAND
                ================================== */}

                <div className="flex min-w-0 items-center gap-3 sm:gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-md sm:h-12 sm:w-12">

                        <ShieldCheck
                            size={25}
                        />

                    </div>


                    <div className="min-w-0">

                        <h1 className="truncate text-lg font-bold text-slate-800 sm:text-xl">
                            Emergency Response Dashboard
                        </h1>

                        <p className="hidden text-sm text-slate-500 sm:block">
                            Real-time Emergency Management System
                        </p>

                    </div>

                </div>


                {/* ==================================
                    RIGHT SIDE
                ================================== */}

                <div className="flex shrink-0 items-center gap-2 sm:gap-4 lg:gap-5">


                    {/* ==================================
                        ADMIN INFORMATION
                    ================================== */}

                    <div className="hidden items-center gap-2 md:flex">

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">

                            <Users
                                size={18}
                                className="text-slate-600"
                            />

                        </div>


                        <div>

                            <p className="max-w-[140px] truncate text-sm font-semibold text-slate-700">

                                {admin?.name ||
                                    admin?.username ||
                                    "Admin"}

                            </p>

                            <p className="text-xs capitalize text-slate-500">

                                {admin?.department ||
                                    "Admin"}

                            </p>

                        </div>

                    </div>


                    {/* ==================================
                        REFRESH
                    ================================== */}

                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
                    >

                        <RefreshCw
                            size={17}
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        <span className="hidden sm:inline">
                            {refreshing
                                ? "Refreshing..."
                                : "Refresh"}
                        </span>

                    </button>


                    {/* ==================================
                        LOGOUT
                    ================================== */}

                    <button
                        type="button"
                        onClick={onLogout}
                        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:px-4"
                    >

                        <LogOut
                            size={17}
                        />

                        <span className="hidden sm:inline">
                            Logout
                        </span>

                    </button>

                </div>

            </div>

        </header>
    );
}

export default AdminHeader;