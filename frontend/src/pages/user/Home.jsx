import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    Ambulance,
    ArrowLeft,
    ArrowRight,
    Bot,
    Building2,
    CheckCircle2,
    ChevronRight,
    Clock3,
    FireExtinguisher,
    HeartPulse,
    Landmark,
    MapPin,
    Menu,
    Mic,
    Phone,
    Radio,
    Route,
    Shield,
    Siren,
    Users,
    X
} from "lucide-react";

function Home() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            position: "left top",
            eyebrow: "Emergency Response",
            title: "Help when every second matters",
            description:
                "QuickAid helps people report emergencies, share their location and connect requests with the appropriate response department.",
            button: "Get Emergency Help"
        },
        {
            position: "right top",
            eyebrow: "Smart Coordination",
            title: "Connected emergency response",
            description:
                "Emergency information can be organized and routed toward police, medical and fire response teams.",
            button: "Explore Services"
        },
        {
            position: "left bottom",
            eyebrow: "Location Assistance",
            title: "Share your location quickly",
            description:
                "Location services help provide useful information to the emergency response system during an incident.",
            button: "Report Emergency"
        },
        {
            position: "right bottom",
            eyebrow: "Multi-Department Response",
            title: "One platform for critical situations",
            description:
                "AI-assisted classification helps identify emergency type and severity for appropriate response routing.",
            button: "How It Works"
        }
    ];

    const serviceCards = [
        {
            icon: Mic,
            title: "Voice Assistance",
            description:
                "Describe an emergency naturally using voice assistance."
        },
        {
            icon: MapPin,
            title: "Live Location",
            description:
                "Share location information with the emergency response system."
        },
        {
            icon: Bot,
            title: "AI Classification",
            description:
                "AI-assisted classification identifies emergency type and severity."
        },
        {
            icon: Radio,
            title: "Response Coordination",
            description:
                "Connect emergency requests with the appropriate response department."
        },
        {
            icon: Route,
            title: "Location Services",
            description:
                "Use location information to support emergency response."
        },
        {
            icon: Users,
            title: "Department Coordination",
            description:
                "Coordinate emergencies across police, medical and fire services."
        }
    ];

    const departments = [
        {
            icon: Shield,
            title: "Police",
            description:
                "Security, crime and police-related emergencies.",
            iconClass: "text-blue-700",
            bgClass: "bg-blue-50"
        },
        {
            icon: HeartPulse,
            title: "Medical",
            description:
                "Medical emergencies requiring immediate assistance.",
            iconClass: "text-red-600",
            bgClass: "bg-red-50"
        },
        {
            icon: FireExtinguisher,
            title: "Fire & Rescue",
            description:
                "Fire incidents, rescue and related emergencies.",
            iconClass: "text-orange-600",
            bgClass: "bg-orange-50"
        },
        {
            icon: Building2,
            title: "Multi-Department",
            description:
                "Incidents requiring coordination between departments.",
            iconClass: "text-slate-700",
            bgClass: "bg-slate-100"
        }
    ];

    const emergencyServices = [
        {
            title: "Police",
            number: "100",
            description:
                "Police assistance and security-related emergencies.",
            icon: Shield,
            iconClass: "text-blue-700"
        },
        {
            title: "Ambulance",
            number: "108",
            description:
                "Medical emergencies and ambulance assistance.",
            icon: Ambulance,
            iconClass: "text-red-600"
        },
        {
            title: "Fire",
            number: "101",
            description:
                "Fire emergencies and rescue assistance.",
            icon: FireExtinguisher,
            iconClass: "text-orange-600"
        }
    ];

    const processSteps = [
        {
            number: "01",
            icon: Siren,
            title: "Report",
            description:
                "Provide basic information about the emergency."
        },
        {
            number: "02",
            icon: MapPin,
            title: "Locate",
            description:
                "Share your location to support response coordination."
        },
        {
            number: "03",
            icon: Bot,
            title: "Classify",
            description:
                "AI-assisted classification identifies emergency type and severity."
        },
        {
            number: "04",
            icon: Radio,
            title: "Route",
            description:
                "The emergency is associated with the appropriate department."
        },
        {
            number: "05",
            icon: Users,
            title: "Respond",
            description:
                "Authorized response teams can manage the incident."
        }
    ];

    const scrollToSection = (id) => {
        setMenuOpen(false);

        document.getElementById(id)?.scrollIntoView({
            behavior: "smooth"
        });
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(
                (previous) =>
                    (previous + 1) % slides.length
            );
        }, 5000);

        return () => clearInterval(timer);
    }, [slides.length]);

    const previousSlide = () => {
        setCurrentSlide(
            (previous) =>
                (previous - 1 + slides.length) %
                slides.length
        );
    };

    const nextSlide = () => {
        setCurrentSlide(
            (previous) =>
                (previous + 1) % slides.length
        );
    };

    return (
        <div className="min-h-screen bg-white text-slate-800">

            {/* =====================================================
                HEADER
            ====================================================== */}

            <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">

                {/* Utility Bar */}

                <div className="border-b border-slate-200 bg-[#f6f7f8]">

                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">

                        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">

                            <Landmark size={14} />

                            <span>
                                Public Safety & Emergency Response Platform
                            </span>

                        </div>

                        <div className="hidden text-[11px] text-slate-500 sm:block">
                            QuickAid Emergency Response System
                        </div>

                    </div>

                </div>


                {/* Main Navigation */}

                <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                    <Link
                        to="/"
                        className="flex items-center gap-3"
                    >

                        <div className="flex h-12 w-12 items-center justify-center border border-slate-300 bg-white">

                            <Ambulance
                                size={28}
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


                    {/* Desktop Navigation */}

                    <nav className="hidden items-center gap-7 md:flex">

                        <button
                            onClick={() =>
                                scrollToSection("home")
                            }
                            className="text-sm font-semibold text-[#12345b] transition hover:text-[#e66b22]"
                        >
                            Home
                        </button>

                        <button
                            onClick={() =>
                                scrollToSection("services")
                            }
                            className="text-sm font-medium text-slate-600 transition hover:text-[#e66b22]"
                        >
                            Services
                        </button>

                        <button
                            onClick={() =>
                                scrollToSection("how-it-works")
                            }
                            className="text-sm font-medium text-slate-600 transition hover:text-[#e66b22]"
                        >
                            How It Works
                        </button>

                        <button
                            onClick={() =>
                                scrollToSection("departments")
                            }
                            className="text-sm font-medium text-slate-600 transition hover:text-[#e66b22]"
                        >
                            Departments
                        </button>

                        <button
                            onClick={() =>
                                scrollToSection("emergency")
                            }
                            className="text-sm font-medium text-slate-600 transition hover:text-[#e66b22]"
                        >
                            Emergency Numbers
                        </button>

                        <Link
                            to="/admin/login"
                            className="border border-[#12345b] px-5 py-2.5 text-sm font-semibold text-[#12345b] transition hover:bg-[#12345b] hover:text-white"
                        >
                            Admin Login
                        </Link>

                    </nav>


                    {/* Mobile Button */}

                    <button
                        type="button"
                        onClick={() =>
                            setMenuOpen(!menuOpen)
                        }
                        className="border border-slate-300 p-2 md:hidden"
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? (
                            <X size={22} />
                        ) : (
                            <Menu size={22} />
                        )}
                    </button>

                </div>


                {/* Saffron Accent */}

                <div className="h-1 bg-[#e66b22]" />


                {/* Mobile Navigation */}

                {menuOpen && (
                    <div className="border-t border-slate-200 bg-white px-5 py-5 md:hidden">

                        <div className="flex flex-col gap-4">

                            <button
                                onClick={() =>
                                    scrollToSection("home")
                                }
                                className="text-left text-sm font-semibold text-slate-700"
                            >
                                Home
                            </button>

                            <button
                                onClick={() =>
                                    scrollToSection("services")
                                }
                                className="text-left text-sm font-medium text-slate-700"
                            >
                                Services
                            </button>

                            <button
                                onClick={() =>
                                    scrollToSection("how-it-works")
                                }
                                className="text-left text-sm font-medium text-slate-700"
                            >
                                How It Works
                            </button>

                            <button
                                onClick={() =>
                                    scrollToSection("departments")
                                }
                                className="text-left text-sm font-medium text-slate-700"
                            >
                                Departments
                            </button>

                            <button
                                onClick={() =>
                                    scrollToSection("emergency")
                                }
                                className="text-left text-sm font-medium text-slate-700"
                            >
                                Emergency Numbers
                            </button>

                            <Link
                                to="/admin/login"
                                onClick={() =>
                                    setMenuOpen(false)
                                }
                                className="border border-[#12345b] px-4 py-3 text-center text-sm font-semibold text-[#12345b]"
                            >
                                Admin Login
                            </Link>

                        </div>

                    </div>
                )}

            </header>


            {/* =====================================================
                HERO
            ====================================================== */}

            <main>

                <section
                    id="home"
                    className="scroll-mt-28 bg-[#f5f7f9]"
                >

                    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

                        <div className="grid overflow-hidden border border-slate-200 bg-white lg:grid-cols-[0.9fr_1.1fr]">


                            {/* Hero Content */}

                            <div className="relative flex min-h-[510px] flex-col justify-center overflow-hidden px-7 py-12 sm:px-10 lg:px-12">

                                {/* Decorative Lines */}

                                <div className="absolute right-0 top-0 h-28 w-28 border-l border-b border-[#e66b22]/30" />

                                <div className="absolute bottom-0 left-0 h-24 w-24 border-r border-t border-[#12345b]/20" />

                                <div className="absolute right-12 top-14 h-2 w-2 rounded-full bg-[#e66b22]" />

                                <div className="absolute bottom-20 left-10 h-2 w-2 rounded-full bg-[#12345b]" />


                                <div className="relative z-10">

                                    <div className="mb-5 inline-flex items-center gap-2 border border-[#e66b22]/40 bg-[#fff8f2] px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[#c75514]">

                                        <Siren size={14} />

                                        Emergency Response Platform

                                    </div>


                                    <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-[#12345b] sm:text-5xl">

                                        Faster access to
                                        <span className="block text-[#e66b22]">
                                            emergency assistance
                                        </span>

                                    </h1>


                                    <p className="mt-6 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">

                                        QuickAid is designed to simplify
                                        emergency reporting, location
                                        sharing and response coordination
                                        through a single platform.

                                    </p>


                                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">

                                        <Link
                                            to="/help"
                                            className="inline-flex items-center justify-center gap-2 bg-[#e66b22] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#d35d17]"
                                        >

                                            Get Emergency Help

                                            <ArrowRight size={17} />

                                        </Link>


                                        <button
                                            onClick={() =>
                                                scrollToSection(
                                                    "how-it-works"
                                                )
                                            }
                                            className="inline-flex items-center justify-center gap-2 border border-[#12345b] px-6 py-3.5 text-sm font-semibold text-[#12345b] transition hover:bg-[#12345b] hover:text-white"
                                        >

                                            How It Works

                                            <ChevronRight size={17} />

                                        </button>

                                    </div>


                                    {/* Small Trust Points */}

                                    <div className="mt-9 grid max-w-lg grid-cols-2 gap-4 border-t border-slate-200 pt-6 sm:grid-cols-3">

                                        <div className="flex items-start gap-2">

                                            <CheckCircle2
                                                size={17}
                                                className="mt-0.5 text-[#12345b]"
                                            />

                                            <span className="text-xs leading-5 text-slate-600">
                                                Location
                                                assistance
                                            </span>

                                        </div>

                                        <div className="flex items-start gap-2">

                                            <CheckCircle2
                                                size={17}
                                                className="mt-0.5 text-[#12345b]"
                                            />

                                            <span className="text-xs leading-5 text-slate-600">
                                                AI-assisted
                                                classification
                                            </span>

                                        </div>

                                        <div className="flex items-start gap-2">

                                            <CheckCircle2
                                                size={17}
                                                className="mt-0.5 text-[#12345b]"
                                            />

                                            <span className="text-xs leading-5 text-slate-600">
                                                Department
                                                coordination
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* Hero Carousel */}

                            <div className="relative min-h-[380px] overflow-hidden bg-slate-100 lg:min-h-[510px]">

                                {slides.map(
                                    (slide, index) => (
                                        <div
                                            key={
                                                slide.title
                                            }
                                            className={`absolute inset-0 transition-opacity duration-700 ${currentSlide ===
                                                    index
                                                    ? "opacity-100"
                                                    : "pointer-events-none opacity-0"
                                                }`}
                                        >

                                            {/* Generated composite image.
                                                Each slide crops one quadrant. */}

                                            <div
                                                className="absolute inset-0 bg-cover bg-no-repeat"
                                                style={{
                                                    backgroundImage:
                                                        "url('/images/quickaid-hero.png')",
                                                    backgroundPosition:
                                                        slide.position,
                                                    backgroundSize:
                                                        "200% 200%"
                                                }}
                                            />

                                            <div className="absolute inset-0 bg-gradient-to-t from-[#071a2e]/80 via-[#071a2e]/10 to-transparent" />


                                            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">

                                                <div className="max-w-lg">

                                                    <div className="mb-3 inline-flex border border-white/40 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">

                                                        {
                                                            slide.eyebrow
                                                        }

                                                    </div>

                                                    <h2 className="text-2xl font-bold text-white sm:text-3xl">

                                                        {
                                                            slide.title
                                                        }

                                                    </h2>

                                                    <p className="mt-3 text-sm leading-6 text-white/90">

                                                        {
                                                            slide.description
                                                        }

                                                    </p>

                                                </div>

                                            </div>

                                        </div>
                                    )
                                )}


                                {/* Previous */}

                                <button
                                    type="button"
                                    onClick={
                                        previousSlide
                                    }
                                    className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/60 bg-black/20 text-white backdrop-blur-sm transition hover:bg-black/40"
                                    aria-label="Previous slide"
                                >

                                    <ArrowLeft
                                        size={18}
                                    />

                                </button>


                                {/* Next */}

                                <button
                                    type="button"
                                    onClick={
                                        nextSlide
                                    }
                                    className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/60 bg-black/20 text-white backdrop-blur-sm transition hover:bg-black/40"
                                    aria-label="Next slide"
                                >

                                    <ArrowRight
                                        size={18}
                                    />

                                </button>


                                {/* Dots */}

                                <div className="absolute bottom-5 right-6 flex items-center gap-2">

                                    {slides.map(
                                        (_, index) => (
                                            <button
                                                key={
                                                    index
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setCurrentSlide(
                                                        index
                                                    )
                                                }
                                                className={`h-2 rounded-full transition-all ${currentSlide ===
                                                        index
                                                        ? "w-8 bg-white"
                                                        : "w-2 bg-white/60"
                                                    }`}
                                                aria-label={`Go to slide ${index + 1
                                                    }`}
                                            />
                                        )
                                    )}

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    QUICK ACCESS STRIP
                ====================================================== */}

                <section className="border-y border-slate-200 bg-white">

                    <div className="mx-auto grid max-w-7xl md:grid-cols-3">

                        <div className="border-b border-slate-200 px-6 py-7 md:border-b-0 md:border-r">

                            <div className="flex items-center gap-4">

                                <div className="flex h-11 w-11 items-center justify-center bg-blue-50">

                                    <Shield
                                        size={23}
                                        className="text-blue-700"
                                    />

                                </div>

                                <div>

                                    <p className="text-sm font-bold text-[#12345b]">
                                        Police Assistance
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Security emergencies
                                    </p>

                                </div>

                            </div>

                        </div>


                        <div className="border-b border-slate-200 px-6 py-7 md:border-b-0 md:border-r">

                            <div className="flex items-center gap-4">

                                <div className="flex h-11 w-11 items-center justify-center bg-red-50">

                                    <Ambulance
                                        size={23}
                                        className="text-red-600"
                                    />

                                </div>

                                <div>

                                    <p className="text-sm font-bold text-[#12345b]">
                                        Medical Assistance
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Medical emergencies
                                    </p>

                                </div>

                            </div>

                        </div>


                        <div className="px-6 py-7">

                            <div className="flex items-center gap-4">

                                <div className="flex h-11 w-11 items-center justify-center bg-orange-50">

                                    <FireExtinguisher
                                        size={23}
                                        className="text-orange-600"
                                    />

                                </div>

                                <div>

                                    <p className="text-sm font-bold text-[#12345b]">
                                        Fire & Rescue
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Fire and rescue emergencies
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    SECTION TITLE / THEMES STYLE
                ====================================================== */}

                <section
                    id="services"
                    className="scroll-mt-28 relative overflow-hidden bg-[#fffaf4] px-4 py-20 sm:px-6 lg:px-8"
                >

                    {/* Background city-like decoration */}

                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex h-40 items-end opacity-40">

                        <div className="h-20 w-[8%] bg-[#f0e7d9]" />
                        <div className="h-28 w-[10%] bg-[#f0e7d9]" />
                        <div className="h-16 w-[7%] bg-[#f0e7d9]" />
                        <div className="h-32 w-[12%] bg-[#f0e7d9]" />
                        <div className="h-24 w-[9%] bg-[#f0e7d9]" />
                        <div className="h-36 w-[11%] bg-[#f0e7d9]" />
                        <div className="h-20 w-[8%] bg-[#f0e7d9]" />
                        <div className="h-30 w-[13%] bg-[#f0e7d9]" />
                        <div className="h-24 w-[10%] bg-[#f0e7d9]" />
                        <div className="h-32 w-[12%] bg-[#f0e7d9]" />

                    </div>


                    <div className="relative mx-auto max-w-7xl">

                        <div className="mx-auto max-w-2xl text-center">

                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#e66b22]">
                                QUICKAID SERVICES
                            </p>

                            <h2 className="mt-3 text-3xl font-extrabold text-[#12345b] sm:text-4xl">
                                Technology supporting emergency response
                            </h2>

                            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600">
                                A collection of tools designed to
                                simplify emergency reporting and
                                response coordination.
                            </p>

                        </div>


                        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                            {serviceCards.map(
                                (service) => {
                                    const Icon =
                                        service.icon;

                                    return (
                                        <div
                                            key={
                                                service.title
                                            }
                                            className="group border border-[#e7d9c8] bg-white p-7 transition hover:-translate-y-1 hover:border-[#e66b22] hover:shadow-md"
                                        >

                                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e66b22]/40 bg-[#fff8f2] text-[#12345b]">

                                                <Icon
                                                    size={22}
                                                />

                                            </div>

                                            <h3 className="mt-5 text-lg font-bold text-[#12345b]">

                                                {
                                                    service.title
                                                }

                                            </h3>

                                            <p className="mt-2 text-sm leading-6 text-slate-600">

                                                {
                                                    service.description
                                                }

                                            </p>

                                            <div className="mt-5 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[#e66b22]">

                                                Learn more

                                                <ChevronRight
                                                    size={14}
                                                />

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    HOW IT WORKS
                ====================================================== */}

                <section
                    id="how-it-works"
                    className="scroll-mt-28 bg-white px-4 py-20 sm:px-6 lg:px-8"
                >

                    <div className="mx-auto max-w-7xl">

                        <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-7 md:flex-row md:items-end">

                            <div>

                                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#e66b22]">
                                    RESPONSE PROCESS
                                </p>

                                <h2 className="mt-2 text-3xl font-extrabold text-[#12345b]">
                                    How QuickAid works
                                </h2>

                            </div>

                            <p className="max-w-lg text-sm leading-6 text-slate-600">
                                From emergency reporting to
                                department coordination, the platform
                                follows a structured response flow.
                            </p>

                        </div>


                        <div className="mt-10 grid gap-0 border border-slate-200 md:grid-cols-5">

                            {processSteps.map(
                                (step, index) => {
                                    const Icon =
                                        step.icon;

                                    return (
                                        <div
                                            key={
                                                step.number
                                            }
                                            className={`relative p-6 ${index <
                                                    processSteps.length -
                                                    1
                                                    ? "border-b border-slate-200 md:border-b-0 md:border-r"
                                                    : ""
                                                }`}
                                        >

                                            <div className="flex items-center justify-between">

                                                <span className="text-3xl font-extrabold text-slate-200">
                                                    {
                                                        step.number
                                                    }
                                                </span>

                                                <div className="flex h-10 w-10 items-center justify-center bg-[#eef2f6] text-[#12345b]">

                                                    <Icon
                                                        size={19}
                                                    />

                                                </div>

                                            </div>

                                            <h3 className="mt-6 font-bold text-[#12345b]">
                                                {
                                                    step.title
                                                }
                                            </h3>

                                            <p className="mt-2 text-xs leading-5 text-slate-600">
                                                {
                                                    step.description
                                                }
                                            </p>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    DEPARTMENTS
                ====================================================== */}

                <section
                    id="departments"
                    className="scroll-mt-28 border-y border-slate-200 bg-[#f5f7f9] px-4 py-20 sm:px-6 lg:px-8"
                >

                    <div className="mx-auto max-w-7xl">

                        <div className="mx-auto max-w-2xl text-center">

                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#e66b22]">
                                RESPONSE DEPARTMENTS
                            </p>

                            <h2 className="mt-3 text-3xl font-extrabold text-[#12345b]">
                                Connect the right response team
                            </h2>

                            <p className="mt-4 text-sm leading-6 text-slate-600">
                                Emergency requests can be associated
                                with the department responsible for
                                handling the incident.
                            </p>

                        </div>


                        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                            {departments.map(
                                (department) => {
                                    const Icon =
                                        department.icon;

                                    return (
                                        <div
                                            key={
                                                department.title
                                            }
                                            className="border border-slate-200 bg-white p-6"
                                        >

                                            <div
                                                className={`flex h-12 w-12 items-center justify-center ${department.bgClass}`}
                                            >

                                                <Icon
                                                    size={23}
                                                    className={
                                                        department.iconClass
                                                    }
                                                />

                                            </div>

                                            <h3 className="mt-5 font-bold text-[#12345b]">
                                                {
                                                    department.title
                                                }
                                            </h3>

                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                {
                                                    department.description
                                                }
                                            </p>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    EMERGENCY NUMBERS
                ====================================================== */}

                <section
                    id="emergency"
                    className="scroll-mt-28 bg-white px-4 py-20 sm:px-6 lg:px-8"
                >

                    <div className="mx-auto max-w-7xl">

                        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

                            <div>

                                <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-600">
                                    EMERGENCY NUMBERS
                                </p>

                                <h2 className="mt-2 text-3xl font-extrabold text-[#12345b]">
                                    Immediate assistance
                                </h2>

                                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                                    Keep important emergency contact
                                    numbers available when immediate
                                    assistance is required.
                                </p>

                            </div>

                            <Clock3
                                size={38}
                                className="hidden text-slate-200 md:block"
                            />

                        </div>


                        <div className="mt-10 grid gap-5 md:grid-cols-3">

                            {emergencyServices.map(
                                (service) => {
                                    const Icon =
                                        service.icon;

                                    return (
                                        <div
                                            key={
                                                service.title
                                            }
                                            className="border border-slate-200 bg-white"
                                        >

                                            <div className="flex items-center justify-between border-b border-slate-200 bg-[#fafafa] px-6 py-5">

                                                <div className="flex items-center gap-3">

                                                    <Icon
                                                        size={25}
                                                        className={
                                                            service.iconClass
                                                        }
                                                    />

                                                    <h3 className="font-bold text-[#12345b]">
                                                        {
                                                            service.title
                                                        }
                                                    </h3>

                                                </div>

                                                <span className="text-3xl font-extrabold text-[#12345b]">
                                                    {
                                                        service.number
                                                    }
                                                </span>

                                            </div>


                                            <div className="px-6 py-6">

                                                <p className="text-sm leading-6 text-slate-600">
                                                    {
                                                        service.description
                                                    }
                                                </p>

                                                <a
                                                    href={`tel:${service.number}`}
                                                    className="mt-5 inline-flex items-center gap-2 border border-[#12345b] px-5 py-2.5 text-sm font-semibold text-[#12345b] transition hover:bg-[#12345b] hover:text-white"
                                                >

                                                    <Phone
                                                        size={16}
                                                    />

                                                    Call{" "}
                                                    {
                                                        service.title
                                                    }

                                                </a>

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    ABOUT / TECHNOLOGY
                ====================================================== */}

                <section
                    id="about"
                    className="scroll-mt-28 border-y border-slate-200 bg-[#f5f7f9] px-4 py-20 sm:px-6 lg:px-8"
                >

                    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">

                        <div>

                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#e66b22]">
                                ABOUT QUICKAID
                            </p>

                            <h2 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight text-[#12345b] sm:text-4xl">
                                A technology platform for emergency response coordination
                            </h2>

                            <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-600">
                                QuickAid is designed to simplify the
                                process of reporting an emergency,
                                providing location information and
                                connecting emergency requests with
                                response departments.
                            </p>

                            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                                The platform combines location services,
                                voice assistance and AI-assisted
                                emergency classification to support a
                                structured response workflow.
                            </p>


                            <div className="mt-8 grid gap-4 sm:grid-cols-3">

                                <div className="border border-slate-200 bg-white p-4">

                                    <MapPin
                                        size={21}
                                        className="text-[#12345b]"
                                    />

                                    <p className="mt-3 text-sm font-bold text-[#12345b]">
                                        Location
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Location information
                                        support
                                    </p>

                                </div>


                                <div className="border border-slate-200 bg-white p-4">

                                    <Bot
                                        size={21}
                                        className="text-[#12345b]"
                                    />

                                    <p className="mt-3 text-sm font-bold text-[#12345b]">
                                        AI Assistance
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Emergency
                                        classification
                                    </p>

                                </div>


                                <div className="border border-slate-200 bg-white p-4">

                                    <Radio
                                        size={21}
                                        className="text-[#12345b]"
                                    />

                                    <p className="mt-3 text-sm font-bold text-[#12345b]">
                                        Coordination
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Department
                                        routing
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* Right Information Panel */}

                        <div className="border border-slate-200 bg-white">

                            <div className="border-b border-slate-200 bg-[#12345b] px-6 py-5">

                                <div className="flex items-center gap-3">

                                    <Shield
                                        size={22}
                                        className="text-white"
                                    />

                                    <div>

                                        <h3 className="font-bold text-white">
                                            Emergency Response Network
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-300">
                                            QuickAid response structure
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <div className="divide-y divide-slate-200">

                                {departments.map(
                                    (department) => {
                                        const Icon =
                                            department.icon;

                                        return (
                                            <div
                                                key={
                                                    department.title
                                                }
                                                className="flex items-center gap-4 px-6 py-5"
                                            >

                                                <div
                                                    className={`flex h-10 w-10 items-center justify-center ${department.bgClass}`}
                                                >

                                                    <Icon
                                                        size={19}
                                                        className={
                                                            department.iconClass
                                                        }
                                                    />

                                                </div>

                                                <div className="flex-1">

                                                    <p className="text-sm font-bold text-[#12345b]">
                                                        {
                                                            department.title
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {
                                                            department.description
                                                        }
                                                    </p>

                                                </div>

                                                <ChevronRight
                                                    size={17}
                                                    className="text-slate-300"
                                                />

                                            </div>
                                        );
                                    }
                                )}

                            </div>

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    ADMIN CTA
                ====================================================== */}

                <section className="border-b border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8">

                    <div className="mx-auto max-w-7xl">

                        <div className="relative overflow-hidden bg-[#12345b] px-7 py-10 sm:px-10">

                            <div className="absolute right-0 top-0 h-full w-1/3 bg-[#e66b22]/10" />

                            <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">

                                <div>

                                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f5a06b]">
                                        ADMINISTRATION
                                    </p>

                                    <h2 className="mt-3 text-3xl font-extrabold text-white">
                                        Emergency response administration
                                    </h2>

                                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                                        Authorized response personnel can
                                        access emergency incidents and
                                        response information through the
                                        administration portal.
                                    </p>

                                </div>

                                <Link
                                    to="/admin/login"
                                    className="relative inline-flex shrink-0 items-center justify-center gap-2 bg-[#e66b22] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#d35d17]"
                                >
                                    Admin Login
                                    <ArrowRight
                                        size={17}
                                    />
                                </Link>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    FINAL EMERGENCY CTA
                ====================================================== */}

                <section className="bg-[#fffaf4] px-4 py-16 sm:px-6 lg:px-8">

                    <div className="mx-auto max-w-4xl text-center">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff0e5] text-[#e66b22]">

                            <Siren size={27} />

                        </div>

                        <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-[#e66b22]">
                            EMERGENCY ASSISTANCE
                        </p>

                        <h2 className="mt-3 text-3xl font-extrabold text-[#12345b] sm:text-4xl">
                            Need emergency help?
                        </h2>

                        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600">
                            Report your emergency and provide the
                            information needed by the QuickAid response
                            system.
                        </p>

                        <Link
                            to="/help"
                            className="mt-7 inline-flex items-center gap-2 bg-[#e66b22] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#d35d17]"
                        >
                            Get Emergency Help
                            <ArrowRight size={17} />
                        </Link>

                    </div>

                </section>

            </main>


            {/* =====================================================
                FOOTER
            ====================================================== */}

            <footer className="bg-[#f1f3f5]">

                <div className="mx-auto grid max-w-7xl gap-10 border-b border-slate-300 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">


                    {/* Brand */}

                    <div>

                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center border border-slate-300 bg-white">

                                <Ambulance
                                    size={22}
                                    className="text-[#12345b]"
                                />

                            </div>

                            <div>

                                <p className="font-extrabold text-[#12345b]">
                                    Quick
                                    <span className="text-[#e66b22]">
                                        Aid
                                    </span>
                                </p>

                                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                                    Emergency Response System
                                </p>

                            </div>

                        </div>

                        <p className="mt-5 max-w-sm text-sm leading-6 text-slate-600">
                            A technology platform designed for
                            emergency reporting, location assistance
                            and response coordination.
                        </p>

                    </div>


                    {/* Quick Links */}

                    <div>

                        <h3 className="font-bold text-[#12345b]">
                            Quick Links
                        </h3>

                        <div className="mt-5 flex flex-col gap-3 text-sm text-slate-600">

                            <button
                                onClick={() =>
                                    scrollToSection(
                                        "services"
                                    )
                                }
                                className="text-left transition hover:text-[#e66b22]"
                            >
                                Services
                            </button>

                            <button
                                onClick={() =>
                                    scrollToSection(
                                        "how-it-works"
                                    )
                                }
                                className="text-left transition hover:text-[#e66b22]"
                            >
                                How It Works
                            </button>

                            <button
                                onClick={() =>
                                    scrollToSection(
                                        "departments"
                                    )
                                }
                                className="text-left transition hover:text-[#e66b22]"
                            >
                                Departments
                            </button>

                            <button
                                onClick={() =>
                                    scrollToSection(
                                        "emergency"
                                    )
                                }
                                className="text-left transition hover:text-[#e66b22]"
                            >
                                Emergency Numbers
                            </button>

                        </div>

                    </div>


                    {/* Administration */}

                    <div>

                        <h3 className="font-bold text-[#12345b]">
                            Administration
                        </h3>

                        <p className="mt-5 text-sm leading-6 text-slate-600">
                            Authorized emergency response personnel
                            can access the QuickAid administration
                            portal.
                        </p>

                        <Link
                            to="/admin/login"
                            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#12345b] transition hover:text-[#e66b22]"
                        >
                            Admin Login
                            <ArrowRight size={15} />
                        </Link>

                    </div>

                </div>


                {/* Copyright */}

                <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-4 py-5 text-xs text-slate-500 sm:px-6 md:flex-row lg:px-8">

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

export default Home;