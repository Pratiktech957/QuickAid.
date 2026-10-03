import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
    ShieldCheck,
    Lock,
    User,
    LogIn,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Landmark
} from "lucide-react";

import { adminLogin } from "../../api/admin.api";

function AdminLogin() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await adminLogin(formData);

            console.log("Login successful:", response);

            localStorage.setItem(
                "adminToken",
                response.token
            );

            localStorage.setItem(
                "admin",
                JSON.stringify(response.admin)
            );

            navigate("/admin/dashboard");

        } catch (error) {

            console.error("Login error:", error);

            setError(
                error.message || "Login failed"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-800">

            <header className="border-b border-slate-200 bg-white">

                <div className="border-b border-slate-200 bg-[#f6f7f8]">

                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">

                        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">

                            <Landmark size={14} />

                            <span>
                                Public Safety & Emergency Response Platform
                            </span>

                        </div>

                        <span className="hidden text-[11px] text-slate-500 sm:block">
                            QuickAid Emergency Response System
                        </span>

                    </div>

                </div>

                <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                    <Link
                        to="/"
                        className="flex items-center gap-3"
                    >

                        <div className="flex h-12 w-12 items-center justify-center border border-slate-300 bg-white">

                            <ShieldCheck
                                size={27}
                                className="text-[#12345b]"
                            />

                        </div>

                        <div>

                            <div className="text-xl font-extrabold tracking-tight text-[#12345b]">

                                Quick
                                <span className="text-[#e66b22]">
                                    Aid
                                </span>

                            </div>

                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                                Emergency Response System
                            </p>

                        </div>

                    </Link>

                    <Link
                        to="/admin/signup"
                        className="hidden items-center gap-2 border border-[#12345b] px-5 py-2.5 text-sm font-semibold text-[#12345b] transition hover:bg-[#12345b] hover:text-white sm:inline-flex"
                    >

                        Create Admin Account

                        <ArrowRight size={16} />

                    </Link>

                </div>

                <div className="h-1 bg-[#e66b22]" />

            </header>

            <main className="bg-[#f5f7f9] px-4 py-8 sm:px-6 lg:px-8">

                <div className="mx-auto max-w-7xl">

                    <div className="mb-6 flex items-center gap-2 text-xs text-slate-500">

                        <Link
                            to="/"
                            className="transition hover:text-[#12345b]"
                        >
                            Home
                        </Link>

                        <span>/</span>

                        <span className="font-medium text-slate-700">
                            Admin Login
                        </span>

                    </div>

                    <div className="grid overflow-hidden border border-slate-200 bg-white lg:grid-cols-[0.85fr_1.15fr]">

                        <div className="relative hidden overflow-hidden bg-[#12345b] lg:block">

                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-35"
                                style={{
                                    backgroundImage:
                                        "url('/images/quickaid-hero.png')"
                                }}
                            />

                            <div className="absolute inset-0 bg-[#12345b]/80" />

                            <div className="absolute right-8 top-10 h-20 w-20 border border-[#e66b22]/50" />

                            <div className="absolute bottom-12 left-8 h-16 w-16 border border-white/20" />

                            <div className="absolute right-16 bottom-24 h-2 w-2 rounded-full bg-[#e66b22]" />

                            <div className="absolute left-14 top-32 h-2 w-2 rounded-full bg-white/50" />

                            <div className="relative z-10 flex min-h-[650px] flex-col justify-between p-9 xl:p-11">

                                <div>

                                    <div className="mb-8 flex h-14 w-14 items-center justify-center bg-white text-[#12345b]">

                                        <ShieldCheck size={29} />

                                    </div>

                                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f5a06b]">
                                        ADMINISTRATION
                                    </p>

                                    <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white xl:text-4xl">

                                        Emergency response
                                        <span className="block text-[#f5a06b]">
                                            administration
                                        </span>

                                    </h1>

                                    <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">

                                        Secure access for authorized
                                        emergency response personnel
                                        managing incidents, departments
                                        and response operations.

                                    </p>

                                </div>

                                <div className="border-t border-white/15 pt-6">

                                    <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                                        SECURE ACCESS
                                    </p>

                                    <div className="space-y-4">

                                        <div className="flex items-start gap-3">

                                            <CheckCircle2
                                                size={18}
                                                className="mt-0.5 shrink-0 text-[#f5a06b]"
                                            />

                                            <p className="text-sm leading-5 text-slate-300">
                                                Authorized administrator
                                                access
                                            </p>

                                        </div>

                                        <div className="flex items-start gap-3">

                                            <CheckCircle2
                                                size={18}
                                                className="mt-0.5 shrink-0 text-[#f5a06b]"
                                            />

                                            <p className="text-sm leading-5 text-slate-300">
                                                Department-based
                                                response operations
                                            </p>

                                        </div>

                                        <div className="flex items-start gap-3">

                                            <CheckCircle2
                                                size={18}
                                                className="mt-0.5 shrink-0 text-[#f5a06b]"
                                            />

                                            <p className="text-sm leading-5 text-slate-300">
                                                Emergency incident
                                                management
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                        <div className="p-6 sm:p-8 lg:p-10">

                            <div className="mb-8 lg:hidden">

                                <div className="mb-4 flex h-12 w-12 items-center justify-center bg-[#12345b] text-white">

                                    <ShieldCheck size={25} />

                                </div>

                                <p className="text-xs font-bold uppercase tracking-widest text-[#e66b22]">
                                    ADMINISTRATION
                                </p>

                            </div>

                            <div className="mb-8">

                                <p className="text-sm font-semibold text-[#e66b22]">
                                    Administrator Portal
                                </p>

                                <h2 className="mt-2 text-3xl font-extrabold text-[#12345b]">
                                    Sign in
                                </h2>

                                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                                    Enter your registered administrator
                                    credentials to access the QuickAid
                                    response system.
                                </p>

                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >

                                <div>

                                    <label
                                        htmlFor="username"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Username
                                        <span className="ml-1 text-red-600">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">

                                        <User
                                            size={18}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            id="username"
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            placeholder="Enter your username"
                                            required
                                            autoComplete="username"
                                            className="w-full border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-[#12345b] focus:ring-2 focus:ring-[#12345b]/10"
                                        />

                                    </div>

                                </div>

                                <div>

                                    <label
                                        htmlFor="password"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Password
                                        <span className="ml-1 text-red-600">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">

                                        <Lock
                                            size={18}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter your password"
                                            required
                                            autoComplete="current-password"
                                            className="w-full border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-[#12345b] focus:ring-2 focus:ring-[#12345b]/10"
                                        />

                                    </div>

                                </div>

                                {error && (
                                    <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full items-center justify-center gap-2 bg-[#e66b22] py-3.5 text-sm font-bold text-white transition hover:bg-[#d35d17] disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    <LogIn size={18} />

                                    {loading
                                        ? "Signing in..."
                                        : "Sign In"}

                                </button>

                            </form>

                            <div className="mt-7 border-t border-slate-200 pt-6">

                                <p className="text-center text-sm text-slate-500">
                                    Don't have an administrator account?
                                </p>

                                <Link
                                    to="/admin/signup"
                                    className="mt-3 flex w-full items-center justify-center gap-2 border border-[#12345b] py-3 text-sm font-semibold text-[#12345b] transition hover:bg-[#12345b] hover:text-white"
                                >

                                    Create Administrator Account

                                    <ArrowRight size={16} />

                                </Link>

                            </div>

                            <Link
                                to="/"
                                className="mt-7 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#12345b]"
                            >

                                <ArrowLeft size={16} />

                                Back to QuickAid

                            </Link>

                        </div>

                    </div>

                    <div className="mt-6 text-center">

                        <p className="text-xs leading-5 text-slate-400">
                            © 2026 QuickAid Emergency Response System
                            <span className="mx-2">•</span>
                            Emergency response coordination platform
                        </p>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default AdminLogin;