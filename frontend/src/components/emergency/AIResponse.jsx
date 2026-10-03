import {
    AlertTriangle,
    Bot,
    CheckCircle2,
    Copy,
    ExternalLink,
    Info,
    MapPin,
    Phone,
    Share2,
    Sparkles,
    Volume2
} from "lucide-react";

function AIResponse({
    loading,
    aiResponse,
    success,
    error,
    emergencyId,
    trackingToken,
    speakText,
    shareAIResponse,
    shareEmergency,
    navigate
}) {
    const hasResponse = Boolean(
        aiResponse && String(aiResponse).trim()
    );

    const handleReadAloud = () => {
        if (!hasResponse) return;

        speakText(aiResponse);
    };

    const getGuidanceTitle = () => {
        if (!hasResponse) {
            return "Emergency Guidance";
        }

        const text = String(aiResponse).toLowerCase();

        if (
            text.includes("fire") ||
            text.includes("smoke") ||
            text.includes("flame")
        ) {
            return "Fire Safety Guidance";
        }

        if (
            text.includes("accident") ||
            text.includes("traffic") ||
            text.includes("road")
        ) {
            return "Accident Safety Guidance";
        }

        if (
            text.includes("bleeding") ||
            text.includes("injury") ||
            text.includes("injured") ||
            text.includes("medical")
        ) {
            return "Immediate Medical Guidance";
        }

        if (
            text.includes("police") ||
            text.includes("danger") ||
            text.includes("threat")
        ) {
            return "Personal Safety Guidance";
        }

        return "Immediate Safety Guidance";
    };

    return (
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                <div className="flex items-center justify-between gap-4">

                    <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                            <Bot
                                size={24}
                                className="text-blue-600"
                            />
                        </div>

                        <div className="min-w-0">

                            <div className="flex items-center gap-2">

                                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                                    AI Assistance
                                </h2>

                                {hasResponse && (
                                    <span className="hidden items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700 sm:flex">
                                        <Sparkles size={11} />
                                        QuickAid AI
                                    </span>
                                )}

                            </div>

                            <p className="mt-0.5 text-sm text-slate-500">
                                Immediate guidance based on your emergency.
                            </p>

                        </div>

                    </div>

                    {hasResponse && !loading && (
                        <div className="hidden items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 sm:flex">

                            <span className="h-2 w-2 rounded-full bg-emerald-500" />

                            <span className="text-xs font-semibold text-emerald-700">
                                Guidance ready
                            </span>

                        </div>
                    )}

                </div>

            </div>


            {/* ==================================================
                LOADING
            ================================================== */}

            {loading && (

                <div className="px-5 py-6 sm:px-6">

                    <div className="overflow-hidden rounded-xl border border-blue-100 bg-blue-50">

                        <div className="flex items-start gap-4 p-5">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600">

                                <Bot
                                    size={19}
                                    className="text-white"
                                />

                            </div>

                            <div className="min-w-0 flex-1">

                                <div className="flex items-center gap-2">

                                    <p className="text-sm font-bold text-blue-900">
                                        QuickAid Assistant
                                    </p>

                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />

                                </div>

                                <p className="mt-1 text-sm text-blue-700">
                                    Analyzing your emergency...
                                </p>

                                <div className="mt-3 flex items-center gap-1.5">

                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]" />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500" />

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            )}


            {/* ==================================================
                AI GUIDANCE
            ================================================== */}

            {hasResponse && !loading && (

                <div className="px-5 py-5 sm:px-6">

                    {/* Guidance Label */}

                    <div className="mb-3 flex items-center gap-2">

                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">

                            <Info
                                size={15}
                                className="text-blue-600"
                            />

                        </div>

                        <div>

                            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                                QuickAid Guidance
                            </p>

                            <h3 className="text-base font-bold text-slate-900">
                                {getGuidanceTitle()}
                            </h3>

                        </div>

                    </div>


                    {/* Main Guidance Card */}

                    <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-slate-50">

                        {/* Left accent */}

                        <div className="absolute bottom-0 left-0 top-0 w-1 bg-blue-600" />


                        <div className="p-5 pl-6 sm:p-6 sm:pl-7">

                            {/* AI Identity */}

                            <div className="mb-4 flex items-center gap-2">

                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">

                                    <Bot
                                        size={16}
                                        className="text-white"
                                    />

                                </div>

                                <div>

                                    <p className="text-sm font-bold text-slate-800">
                                        QuickAid Assistant
                                    </p>

                                    <p className="text-[11px] text-slate-400">
                                        Emergency guidance
                                    </p>

                                </div>

                            </div>


                            {/* AI Text */}

                            <div className="text-[15px] leading-7 text-slate-700">

                                <p className="whitespace-pre-line">
                                    {aiResponse}
                                </p>

                            </div>


                            {/* ==================================================
                                ACTIONS
                            ================================================== */}

                            <div className="mt-6 flex flex-wrap gap-2.5 border-t border-slate-200 pt-4">

                                <button
                                    type="button"
                                    onClick={handleReadAloud}
                                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
                                >

                                    <Volume2 size={17} />

                                    Read Aloud

                                </button>


                                <button
                                    type="button"
                                    onClick={shareAIResponse}
                                    className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900 active:scale-[0.98]"
                                >

                                    <Share2 size={17} />

                                    Share Advice

                                </button>

                            </div>

                        </div>

                    </div>


                    {/* ==================================================
                        EMERGENCY ACTION
                    ================================================== */}

                    {!emergencyId && (

                        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">

                            <div className="flex items-start gap-3">

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100">

                                    <AlertTriangle
                                        size={18}
                                        className="text-red-600"
                                    />

                                </div>

                                <div className="min-w-0 flex-1">

                                    <p className="text-sm font-bold text-red-900">
                                        Need emergency assistance?
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-red-700">
                                        If you need help from the QuickAid response system, continue with the emergency report.
                                    </p>

                                </div>

                            </div>

                        </div>

                    )}

                </div>

            )}


            {/* ==================================================
                SUCCESS
            ================================================== */}

            {success && (

                <div className="border-t border-emerald-100 bg-emerald-50 px-5 py-5 sm:px-6">

                    <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">

                        <div className="flex items-start gap-4">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100">

                                <CheckCircle2
                                    size={24}
                                    className="text-emerald-600"
                                />

                            </div>

                            <div className="min-w-0 flex-1">

                                <p className="text-base font-bold text-emerald-900">
                                    Emergency Report Submitted
                                </p>

                                <p className="mt-1 text-sm leading-6 text-slate-600">
                                    {success}
                                </p>


                                {emergencyId && (

                                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">

                                        <div className="grid gap-4 sm:grid-cols-2">

                                            <div>

                                                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                                    Emergency ID
                                                </p>

                                                <p className="mt-1 break-all font-mono text-sm font-bold text-slate-800">
                                                    {emergencyId}
                                                </p>

                                            </div>


                                            {trackingToken && (

                                                <div>

                                                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                                        Tracking
                                                    </p>

                                                    <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-emerald-700">

                                                        <MapPin size={15} />

                                                        Tracking available

                                                    </p>

                                                </div>

                                            )}

                                        </div>

                                    </div>

                                )}


                                {/* Buttons */}

                                <div className="mt-4 flex flex-wrap gap-2.5">

                                    {trackingToken && (

                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `/track/${trackingToken}`
                                                )
                                            }
                                            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                                        >

                                            <MapPin size={17} />

                                            Track Emergency

                                            <ExternalLink size={14} />

                                        </button>

                                    )}


                                    {emergencyId && (

                                        <button
                                            type="button"
                                            onClick={shareEmergency}
                                            className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-900"
                                        >

                                            <Share2 size={17} />

                                            Share Details

                                        </button>

                                    )}

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            )}


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <div className="border-t border-red-100 bg-red-50 px-5 py-5 sm:px-6">

                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-white p-4">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100">

                            <AlertTriangle
                                size={19}
                                className="text-red-600"
                            />

                        </div>

                        <div>

                            <p className="text-sm font-bold text-red-900">
                                Unable to continue
                            </p>

                            <p className="mt-1 text-sm leading-6 text-red-700">
                                {error}
                            </p>

                        </div>

                    </div>

                </div>

            )}

        </section>
    );
}

export default AIResponse;