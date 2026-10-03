import {
    LayoutDashboard,
    AlertTriangle,
    MapPin,
    BarChart3,
    Users,
    Settings,
    LogOut,
    Menu,
    X
} from "lucide-react";

import {
    useLocation,
    useNavigate
} from "react-router-dom";

import { useEffect, useState } from "react";

function AdminSidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    // ==========================================
    // MOBILE SIDEBAR STATE
    // ==========================================

    const [isOpen, setIsOpen] =
        useState(false);

    // ==========================================
    // MENU ITEMS
    // ==========================================

    const menuItems = [
        {
            name: "Dashboard",
            path: "/admin/dashboard",
            icon: LayoutDashboard
        },
        {
            name: "Emergencies",
            path: "/admin/emergencies",
            icon: AlertTriangle
        },
        {
            name: "Live Map",
            path: "/admin/live-map",
            icon: MapPin
        },
        {
            name: "Analytics",
            path: "/admin/analytics",
            icon: BarChart3
        },
        {
            name: "Response Units",
            path: "/admin/response-units",
            icon: Users
        },
        {
            name: "Settings",
            path: "/admin/settings",
            icon: Settings
        }
    ];

    // ==========================================
    // CLOSE MOBILE SIDEBAR ON ROUTE CHANGE
    // ==========================================

    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    // ==========================================
    // NAVIGATION
    // ==========================================

    const handleNavigation = (path) => {
        navigate(path);
    };

    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {
        localStorage.removeItem(
            "adminToken"
        );

        localStorage.removeItem(
            "admin"
        );

        navigate("/admin/login");
    };

    // ==========================================
    // ACTIVE PAGE
    // ==========================================

    const isActive = (path) => {
        return location.pathname === path;
    };

    // ==========================================
    // UI
    // ==========================================

    return (
        <>
            {/* ==================================
                MOBILE MENU BUTTON
            ================================== */}

            <button
                type="button"
                onClick={() =>
                    setIsOpen((previous) => !previous)
                }
                className="fixed left-4 top-4 z-[60] rounded-lg bg-slate-900 p-2 text-white shadow-lg lg:hidden"
                aria-label={
                    isOpen
                        ? "Close navigation"
                        : "Open navigation"
                }
                aria-expanded={isOpen}
            >
                {isOpen ? (
                    <X size={22} />
                ) : (
                    <Menu size={22} />
                )}
            </button>


            {/* ==================================
                MOBILE OVERLAY
            ================================== */}

            {isOpen && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={() =>
                        setIsOpen(false)
                    }
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                />
            )}


            {/* ==================================
                SIDEBAR
            ================================== */}

            <aside
                className={`
                    fixed left-0 top-0 z-50
                    flex h-screen w-64 flex-col
                    border-r border-slate-200 bg-white
                    transition-transform duration-300
                    lg:translate-x-0
                    ${isOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                    }
                `}
            >

                {/* ==================================
                    LOGO
                ================================== */}

                <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-6">

                    <div>

                        <h1 className="text-xl font-bold text-slate-900">
                            QuickAid
                        </h1>

                        <p className="text-xs text-slate-500">
                            Admin Panel
                        </p>

                    </div>

                </div>


                {/* ==================================
                    NAVIGATION
                ================================== */}

                <nav className="flex-1 space-y-1 overflow-y-auto p-4">

                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        const active =
                            isActive(item.path);

                        return (
                            <button
                                key={item.path}
                                type="button"
                                onClick={() =>
                                    handleNavigation(
                                        item.path
                                    )
                                }
                                className={`
                                    flex w-full items-center gap-3
                                    rounded-lg px-4 py-3
                                    text-sm font-medium
                                    transition
                                    ${active
                                        ? "bg-slate-900 text-white"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    }
                                `}
                            >

                                <Icon size={19} />

                                <span>
                                    {item.name}
                                </span>

                            </button>
                        );
                    })}

                </nav>


                {/* ==================================
                    LOGOUT
                ================================== */}

                <div className="shrink-0 border-t border-slate-200 p-4">

                    <button
                        type="button"
                        onClick={
                            handleLogout
                        }
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >

                        <LogOut size={19} />

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            </aside>
        </>
    );
}

export default AdminSidebar;