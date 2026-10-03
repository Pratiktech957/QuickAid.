import {
    Bot,
    Car,
    Flame,
    HeartPulse,
    Mic,
    Send,
    Shield,
    Square,
    Loader2,
    Globe2,
    Sparkles,
    MessageSquareText
} from "lucide-react";

function EmergencyAssistant({
    query,
    setQuery,
    language,
    setLanguage,
    processing,
    voiceStatus,
    startVoiceInput,
    stopVoiceInput,
    quickHelp,
    processQuery
}) {
    const quickActions = [
        {
            type: "medical",
            label: "Medical Emergency",
            description: "Injury, illness or medical crisis",
            icon: HeartPulse,
            iconClass: "text-red-600",
            iconBg: "bg-red-50",
            hover: "hover:border-red-300 hover:bg-red-50/50"
        },
        {
            type: "police",
            label: "Police Assistance",
            description: "Crime, threat or safety issue",
            icon: Shield,
            iconClass: "text-blue-600",
            iconBg: "bg-blue-50",
            hover: "hover:border-blue-300 hover:bg-blue-50/50"
        },
        {
            type: "fire",
            label: "Fire Emergency",
            description: "Fire, smoke or hazardous situation",
            icon: Flame,
            iconClass: "text-orange-600",
            iconBg: "bg-orange-50",
            hover: "hover:border-orange-300 hover:bg-orange-50/50"
        },
        {
            type: "accident",
            label: "Road Accident",
            description: "Collision, crash or road injury",
            icon: Car,
            iconClass: "text-slate-700",
            iconBg: "bg-slate-100",
            hover: "hover:border-slate-400 hover:bg-slate-50"
        }
    ];

    const languages = [
        ["en", "English"],
        ["hi", "हिंदी"],
        ["or", "ଓଡ଼ିଆ"]
    ];

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                <div className="flex items-start justify-between gap-4">

                    <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                            <Bot
                                size={25}
                                className="text-blue-600"
                            />
                        </div>

                        <div className="min-w-0">

                            <div className="flex items-center gap-2">

                                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                                    AI Assistance
                                </h2>

                                <span className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 sm:inline-flex">
                                    Ready
                                </span>

                            </div>

                            <p className="mt-0.5 text-sm text-slate-500">
                                Describe what happened and get immediate guidance.
                            </p>

                        </div>

                    </div>

                    <div className="hidden shrink-0 items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-2 sm:flex">

                        <Sparkles
                            size={15}
                            className="text-blue-600"
                        />

                        <span className="text-xs font-medium text-slate-600">
                            QuickAid AI
                        </span>

                    </div>

                </div>

            </div>


            {/* ==================================================
                EMERGENCY MESSAGE INPUT
            ================================================== */}

            <div className="px-5 pt-5 sm:px-6">

                <div
                    className={`relative overflow-hidden rounded-xl border bg-slate-50 transition-all ${processing
                            ? "border-blue-300 ring-4 ring-blue-50"
                            : "border-slate-200 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50"
                        }`}
                >

                    <div className="flex items-start gap-3 px-4 pt-4">

                        <MessageSquareText
                            size={19}
                            className="mt-1 shrink-0 text-slate-400"
                        />

                        <textarea
                            value={query}
                            onChange={(e) =>
                                setQuery(e.target.value)
                            }
                            onKeyDown={(e) => {

                                if (
                                    e.key === "Enter" &&
                                    !e.shiftKey
                                ) {
                                    e.preventDefault();

                                    if (!processing) {
                                        processQuery();
                                    }
                                }
                            }}
                            rows={4}
                            disabled={processing}
                            placeholder="Tell me what happened..."
                            className="min-h-[105px] w-full resize-none bg-transparent text-[15px] leading-6 text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                        />

                    </div>


                    {/* Bottom Input Bar */}

                    <div className="flex items-center justify-between border-t border-slate-200/80 px-3 py-3">

                        <p className="hidden text-xs text-slate-400 sm:block">
                            Press Enter to get assistance
                        </p>

                        <div className="ml-auto flex items-center gap-2">

                            {/* Voice */}

                            <button
                                type="button"
                                onClick={
                                    processing
                                        ? undefined
                                        : startVoiceInput
                                }
                                disabled={processing}
                                title="Use voice input"
                                className={`flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${voiceStatus?.toLowerCase().includes(
                                    "listening"
                                )
                                        ? "bg-red-50 text-red-600 ring-1 ring-red-200"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    } disabled:cursor-not-allowed disabled:opacity-50`}
                            >

                                <Mic size={17} />

                                <span className="hidden sm:inline">
                                    Voice
                                </span>

                            </button>


                            {/* Stop */}

                            {voiceStatus
                                ?.toLowerCase()
                                .includes("listening") && (

                                    <button
                                        type="button"
                                        onClick={stopVoiceInput}
                                        title="Stop voice input"
                                        className="flex h-10 items-center gap-2 rounded-lg bg-red-600 px-3 text-sm font-semibold text-white transition hover:bg-red-700"
                                    >

                                        <Square
                                            size={15}
                                            fill="currentColor"
                                        />

                                        <span className="hidden sm:inline">
                                            Stop
                                        </span>

                                    </button>

                                )}


                            {/* Send */}

                            <button
                                type="button"
                                onClick={() => processQuery()}
                                disabled={
                                    processing ||
                                    !query.trim()
                                }
                                title="Get emergency guidance"
                                className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                {processing ? (
                                    <>
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />

                                        <span className="hidden sm:inline">
                                            Analyzing
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={17} />

                                        <span className="hidden sm:inline">
                                            Get Guidance
                                        </span>
                                    </>
                                )}

                            </button>

                        </div>

                    </div>

                </div>


                {/* Voice Status */}

                {voiceStatus && (

                    <div
                        className={`mt-3 flex items-start gap-2 rounded-lg border px-3 py-2.5 ${voiceStatus
                                .toLowerCase()
                                .includes("listening")
                                ? "border-red-200 bg-red-50 text-red-700"
                                : "border-blue-100 bg-blue-50 text-blue-700"
                            }`}
                    >

                        <Mic
                            size={15}
                            className="mt-0.5 shrink-0"
                        />

                        <p className="text-xs font-medium leading-5">
                            {voiceStatus}
                        </p>

                    </div>

                )}

            </div>


            {/* ==================================================
                QUICK EMERGENCY ACTIONS
            ================================================== */}

            <div className="px-5 pb-5 pt-6 sm:px-6">

                <div className="mb-3 flex items-center justify-between">

                    <div>

                        <h3 className="text-sm font-bold text-slate-800">
                            Quick emergency assistance
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Select an emergency type for immediate guidance.
                        </p>

                    </div>

                </div>


                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                    {quickActions.map(
                        ({
                            type,
                            label,
                            description,
                            icon: Icon,
                            iconClass,
                            iconBg,
                            hover
                        }) => (

                            <button
                                key={type}
                                type="button"
                                onClick={() =>
                                    quickHelp(type)
                                }
                                disabled={processing}
                                className={`group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 ${hover}`}
                            >

                                <div
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
                                >

                                    <Icon
                                        size={21}
                                        className={iconClass}
                                    />

                                </div>


                                <div className="min-w-0 flex-1">

                                    <p className="text-sm font-bold text-slate-800">
                                        {label}
                                    </p>

                                    <p className="mt-0.5 truncate text-xs text-slate-500">
                                        {description}
                                    </p>

                                </div>


                                <span className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500">
                                    →
                                </span>

                            </button>

                        )
                    )}

                </div>

            </div>


            {/* ==================================================
                LANGUAGE
            ================================================== */}

            <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-2">

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200">

                            <Globe2
                                size={15}
                                className="text-slate-600"
                            />

                        </div>

                        <div>

                            <p className="text-xs font-bold text-slate-700">
                                Assistance language
                            </p>

                            <p className="text-[11px] text-slate-400">
                                Choose how QuickAid responds
                            </p>

                        </div>

                    </div>


                    <div className="flex gap-1.5">

                        {languages.map(
                            ([code, label]) => (

                                <button
                                    key={code}
                                    type="button"
                                    onClick={() =>
                                        setLanguage(code)
                                    }
                                    disabled={processing}
                                    className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${language === code
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                                        } disabled:cursor-not-allowed disabled:opacity-50`}
                                >
                                    {label}
                                </button>

                            )
                        )}

                    </div>

                </div>

            </div>


            {/* ==================================================
                PROCESSING STATE
            ================================================== */}

            {processing && (

                <div className="border-t border-blue-100 bg-blue-50 px-5 py-3 sm:px-6">

                    <div className="flex items-center gap-3">

                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">

                            <Bot
                                size={16}
                                className="text-white"
                            />

                        </div>

                        <div>

                            <p className="text-xs font-bold text-blue-900">
                                QuickAid Assistant is analyzing
                            </p>

                            <p className="text-[11px] text-blue-600">
                                Preparing immediate safety guidance...
                            </p>

                        </div>

                        <Loader2
                            size={17}
                            className="ml-auto animate-spin text-blue-600"
                        />

                    </div>

                </div>

            )}

        </section>
    );
}

export default EmergencyAssistant;