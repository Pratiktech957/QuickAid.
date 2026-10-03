import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
    ShieldCheck,
    User,
    Lock,
    Mail,
    Phone,
    Building2,
    UserPlus,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Landmark
} from "lucide-react";

import { adminSignup } from "../../api/admin.api";

function AdminSignup() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        name: "",
        department: "police",
        phone: "",
        email: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {

            const response = await adminSignup(formData);

            setSuccess(response.message);

            setTimeout(() => {
                navigate("/admin/login");
            }, 1200);

        } catch (error) {

            setError(
                error.message || "Registration failed"
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-800">

            {/* =====================================================
                HEADER
            ====================================================== */}

            <header className="border-b border-slate-200 bg-white">

                {/* Utility Bar */}

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


                {/* Main Header */}

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
                        to="/admin/login"
                        className="hidden items-center gap-2 border border-[#12345b] px-5 py-2.5 text-sm font-semibold text-[#12345b] transition hover:bg-[#12345b] hover:text-white sm:inline-flex"
                    >

                        Admin Login

                        <ArrowRight size={16} />

                    </Link>

                </div>


                {/* Saffron Accent */}

                <div className="h-1 bg-[#e66b22]" />

            </header>


            {/* =====================================================
                MAIN
            ====================================================== */}

            <main className="bg-[#f5f7f9] px-4 py-8 sm:px-6 lg:px-8">

                <div className="mx-auto max-w-7xl">

                    {/* Breadcrumb */}

                    <div className="mb-6 flex items-center gap-2 text-xs text-slate-500">

                        <Link
                            to="/"
                            className="hover:text-[#12345b]"
                        >
                            Home
                        </Link>

                        <span>/</span>

                        <Link
                            to="/admin/login"
                            className="hover:text-[#12345b]"
                        >
                            Admin
                        </Link>

                        <span>/</span>

                        <span className="font-medium text-slate-700">
                            Registration
                        </span>

                    </div>


                    {/* Main Registration Layout */}

                    <div className="grid overflow-hidden border border-slate-200 bg-white lg:grid-cols-[0.85fr_1.15fr]">


                        {/* =================================================
                            LEFT INFORMATION PANEL
                        ================================================== */}

                        <div className="relative hidden overflow-hidden bg-[#12345b] lg:block">

                            {/* Background Image */}

                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-35"
                                style={{
                                    backgroundImage:
                                        "url('/images/quickaid-hero.png)"
                                }}
                            />

                            <div className="absolute inset-0 bg-[#12345b]/80" />


                            {/* Decorative Elements */}

                            <div className="absolute right-8 top-10 h-20 w-20 border border-[#e66b22]/50" />

                            <div className="absolute bottom-12 left-8 h-16 w-16 border border-white/20" />

                            <div className="absolute right-16 bottom-24 h-2 w-2 rounded-full bg-[#e66b22]" />

                            <div className="absolute left-14 top-32 h-2 w-2 rounded-full bg-white/50" />


                            <div className="relative z-10 flex min-h-[700px] flex-col justify-between p-9 xl:p-11">

                                <div>

                                    <div className="mb-8 flex h-14 w-14 items-center justify-center bg-white text-[#12345b]">

                                        <UserPlus size={27} />

                                    </div>

                                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f5a06b]">
                                        ADMINISTRATION
                                    </p>

                                    <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white xl:text-4xl">

                                        Register for
                                        <span className="block text-[#f5a06b]">
                                            emergency response
                                        </span>

                                    </h1>

                                    <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">

                                        Create an administrator account
                                        for an authorized police, medical
                                        or fire response department.

                                    </p>

                                </div>


                                {/* Information Points */}

                                <div>

                                    <div className="border-t border-white/15 pt-6">

                                        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                                            Account Information
                                        </p>


                                        <div className="space-y-4">

                                            <div className="flex items-start gap-3">

                                                <CheckCircle2
                                                    size={18}
                                                    className="mt-0.5 shrink-0 text-[#f5a06b]"
                                                />

                                                <p className="text-sm leading-5 text-slate-300">
                                                    Department-specific
                                                    administrator access
                                                </p>

                                            </div>


                                            <div className="flex items-start gap-3">

                                                <CheckCircle2
                                                    size={18}
                                                    className="mt-0.5 shrink-0 text-[#f5a06b]"
                                                />

                                                <p className="text-sm leading-5 text-slate-300">
                                                    Secure password
                                                    authentication
                                                </p>

                                            </div>


                                            <div className="flex items-start gap-3">

                                                <CheckCircle2
                                                    size={18}
                                                    className="mt-0.5 shrink-0 text-[#f5a06b]"
                                                />

                                                <p className="text-sm leading-5 text-slate-300">
                                                    Access to authorized
                                                    response operations
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            FORM PANEL
                        ================================================== */}

                        <div className="p-6 sm:p-8 lg:p-10">


                            {/* Mobile Header */}

                            <div className="mb-7 lg:hidden">

                                <div className="mb-4 flex h-12 w-12 items-center justify-center bg-[#12345b] text-white">

                                    <UserPlus size={24} />

                                </div>

                                <p className="text-xs font-bold uppercase tracking-widest text-[#e66b22]">
                                    ADMINISTRATION
                                </p>

                            </div>


                            {/* Heading */}

                            <div className="mb-8">

                                <p className="text-sm font-semibold text-[#e66b22]">
                                    Administrator Portal
                                </p>

                                <h2 className="mt-2 text-3xl font-extrabold text-[#12345b]">
                                    Create Admin Account
                                </h2>

                                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                                    Register an authorized emergency
                                    response department account.
                                </p>

                            </div>


                            {/* Form */}

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >

                                <div>

                                    <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-3">

                                        <div>

                                            <h3 className="font-bold text-[#12345b]">
                                                Account Information
                                            </h3>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Fields marked with{" "}
                                                <span className="text-red-600">
                                                    *
                                                </span>{" "}
                                                are required.
                                            </p>

                                        </div>

                                    </div>


                                    <div className="grid gap-5 md:grid-cols-2">


                                        {/* Full Name */}

                                        <div>

                                            <label
                                                htmlFor="name"
                                                className="mb-2 block text-sm font-semibold text-slate-700"
                                            >
                                                Full Name{" "}
                                                <span className="text-red-600">
                                                    *
                                                </span>
                                            </label>

                                            <div className="relative">

                                                <User
                                                    size={17}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                />

                                                <input
                                                    id="name"
                                                    type="text"
                                                    name="name"
                                                    value={
                                                        formData.name
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder="Enter full name"
                                                    required
                                                    autoComplete="name"
                                                    className="w-full border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#12345b] focus:ring-2 focus:ring-[#12345b]/10"
                                                />

                                            </div>

                                        </div>


                                        {/* Username */}

                                        <div>

                                            <label
                                                htmlFor="username"
                                                className="mb-2 block text-sm font-semibold text-slate-700"
                                            >
                                                Username{" "}
                                                <span className="text-red-600">
                                                    *
                                                </span>
                                            </label>

                                            <div className="relative">

                                                <UserPlus
                                                    size={17}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                />

                                                <input
                                                    id="username"
                                                    type="text"
                                                    name="username"
                                                    value={
                                                        formData.username
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder="Create username"
                                                    required
                                                    autoComplete="username"
                                                    className="w-full border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#12345b] focus:ring-2 focus:ring-[#12345b]/10"
                                                />

                                            </div>

                                        </div>


                                        {/* Password */}

                                        <div>

                                            <label
                                                htmlFor="password"
                                                className="mb-2 block text-sm font-semibold text-slate-700"
                                            >
                                                Password{" "}
                                                <span className="text-red-600">
                                                    *
                                                </span>
                                            </label>

                                            <div className="relative">

                                                <Lock
                                                    size={17}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                />

                                                <input
                                                    id="password"
                                                    type="password"
                                                    name="password"
                                                    value={
                                                        formData.password
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder="Create password"
                                                    required
                                                    autoComplete="new-password"
                                                    className="w-full border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#12345b] focus:ring-2 focus:ring-[#12345b]/10"
                                                />

                                            </div>

                                        </div>


                                        {/* Department */}

                                        <div>

                                            <label
                                                htmlFor="department"
                                                className="mb-2 block text-sm font-semibold text-slate-700"
                                            >
                                                Department{" "}
                                                <span className="text-red-600">
                                                    *
                                                </span>
                                            </label>

                                            <div className="relative">

                                                <Building2
                                                    size={17}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                />

                                                <select
                                                    id="department"
                                                    name="department"
                                                    value={
                                                        formData.department
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    className="w-full appearance-none border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#12345b] focus:ring-2 focus:ring-[#12345b]/10"
                                                >

                                                    <option value="police">
                                                        Police
                                                    </option>

                                                    <option value="medical">
                                                        Medical
                                                    </option>

                                                    <option value="fire">
                                                        Fire Department
                                                    </option>

                                                </select>

                                            </div>

                                        </div>


                                        {/* Phone */}

                                        <div>

                                            <label
                                                htmlFor="phone"
                                                className="mb-2 block text-sm font-semibold text-slate-700"
                                            >
                                                Phone Number
                                            </label>

                                            <div className="relative">

                                                <Phone
                                                    size={17}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                />

                                                <input
                                                    id="phone"
                                                    type="tel"
                                                    name="phone"
                                                    value={
                                                        formData.phone
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder="Enter phone number"
                                                    autoComplete="tel"
                                                    className="w-full border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#12345b] focus:ring-2 focus:ring-[#12345b]/10"
                                                />

                                            </div>

                                        </div>


                                        {/* Email */}

                                        <div>

                                            <label
                                                htmlFor="email"
                                                className="mb-2 block text-sm font-semibold text-slate-700"
                                            >
                                                Email Address
                                            </label>

                                            <div className="relative">

                                                <Mail
                                                    size={17}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                />

                                                <input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    value={
                                                        formData.email
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder="Enter email address"
                                                    autoComplete="email"
                                                    className="w-full border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#12345b] focus:ring-2 focus:ring-[#12345b]/10"
                                                />

                                            </div>

                                        </div>

                                    </div>

                                </div>


                                {/* Important Notice */}

                                <div className="border border-[#e7d9c8] bg-[#fffaf4] px-5 py-4">

                                    <div className="flex gap-3">

                                        <ShieldCheck
                                            size={20}
                                            className="mt-0.5 shrink-0 text-[#12345b]"
                                        />

                                        <div>

                                            <p className="text-sm font-bold text-[#12345b]">
                                                Administrator access
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-slate-600">

                                                Public registration is
                                                available for Police,
                                                Medical and Fire
                                                departments. Superadmin
                                                accounts are created
                                                through the controlled
                                                system setup process.

                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* Error */}

                                {error && (
                                    <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                                        {error}

                                    </div>
                                )}


                                {/* Success */}

                                {success && (
                                    <div className="border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">

                                        {success}

                                    </div>
                                )}


                                {/* Actions */}

                                <div className="flex flex-col-reverse gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">

                                    <Link
                                        to="/admin/login"
                                        className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#12345b] transition hover:text-[#e66b22]"
                                    >

                                        <ArrowLeft
                                            size={16}
                                        />

                                        Already registered? Login

                                    </Link>


                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="inline-flex items-center justify-center gap-2 bg-[#e66b22] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#d35d17] disabled:cursor-not-allowed disabled:opacity-60"
                                    >

                                        <UserPlus size={17} />

                                        {loading
                                            ? "Creating Account..."
                                            : "Register Admin Account"}

                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>


                    {/* Back */}

                    <div className="mt-6 text-center">

                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#12345b]"
                        >

                            <ArrowLeft size={15} />

                            Return to QuickAid

                        </Link>

                    </div>

                </div>

            </main>


            {/* =====================================================
                FOOTER
            ====================================================== */}

            <footer className="border-t border-slate-300 bg-white">

                <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">

                    <p>
                        © 2026 QuickAid Emergency Response System
                    </p>

                    <p>
                        Emergency response coordination platform
                    </p>

                </div>

            </footer>

        </div>
    );
}

export default AdminSignup;