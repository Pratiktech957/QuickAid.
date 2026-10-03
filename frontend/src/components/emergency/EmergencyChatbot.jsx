import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    MessageCircle,
    X,
    Send,
    Mic,
    MicOff,
    Volume2,
    Plus,
    MapPin,
    AlertTriangle,
    CheckCircle2,
    Loader2
} from "lucide-react";

import { askAI } from "../../api/ai.api";
import { createEmergency } from "../../api/emergency.api";
import { saveConversationMessage } from "../../api/conversation.api";

import {
    generateSpeech
} from "../../api/textToSpeech.api";

import {
    playBase64Audio,
    stopBase64Audio
} from "../../utils/audioPlayer";

import {
    connectVoice,
    sendVoiceAudio,
    stopVoice
} from "../../utils/voiceSocket";

import {
    startVoiceRecorder,
    stopVoiceRecorder
} from "../../utils/voiceRecorder";


// ======================================================
// INITIAL EMERGENCY STATE
// ======================================================

const createInitialEmergencyState = () => ({

    step: "name",

    language: null,

    name: null,

    mobile: null,

    description: null,

    emergencyType: null,

    severity: null,

    locationAvailable: false,

    locationText: null,

    confirmed: false,

    submitted: false,

    emergencyId: null,

    trackingToken: null
});


// ======================================================
// SESSION ID
// ======================================================

const createSessionId = () => {

    if (
        typeof crypto !== "undefined" &&
        crypto.randomUUID
    ) {
        return crypto.randomUUID();
    }

    return `quickaid-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;
};


// ======================================================
// NORMALIZE MOBILE
// ======================================================

const normalizeMobile = (value) => {

    if (!value) {
        return null;
    }

    const cleaned =
        String(value)
            .replace(/\D/g, "");

    if (
        /^[6-9]\d{9}$/.test(cleaned)
    ) {
        return cleaned;
    }

    return null;
};


// ======================================================
// NORMALIZE TEXT
// ======================================================

const normalizeText = (value) => {

    if (
        value === null ||
        value === undefined
    ) {
        return null;
    }

    const cleaned =
        String(value)
            .trim()
            .replace(/\s+/g, " ");

    return cleaned || null;
};


// ======================================================
// VALID EMERGENCY TYPES
// ======================================================

const VALID_EMERGENCY_TYPES = [
    "medical",
    "police",
    "fire",
    "accident",
    "other"
];


// ======================================================
// VALID SEVERITIES
// ======================================================

const VALID_SEVERITIES = [
    "low",
    "medium",
    "high",
    "critical"
];


// ======================================================
// COMPONENT
// ======================================================

function EmergencyChatbot() {

    // ==================================================
    // OPEN / CLOSE
    // ==================================================

    const [isOpen, setIsOpen] =
        useState(false);


    // ==================================================
    // MODE
    // ==================================================

    const [mode, setMode] =
        useState("chat");


    // ==================================================
    // SESSION
    // ==================================================

    const [sessionId, setSessionId] =
        useState(createSessionId);


    // ==================================================
    // LANGUAGE
    // ==================================================

    const [conversationLanguage, setConversationLanguage] =
        useState(null);


    // ==================================================
    // MESSAGE
    // ==================================================

    const [message, setMessage] =
        useState("");


    // ==================================================
    // MESSAGES
    // ==================================================

    const [messages, setMessages] =
        useState([]);


    // ==================================================
    // LOADING
    // ==================================================

    const [loading, setLoading] =
        useState(false);


    // ==================================================
    // ERROR
    // ==================================================

    const [error, setError] =
        useState("");


    // ==================================================
    // EMERGENCY STATE
    // ==================================================

    const [emergencyState, setEmergencyState] =
        useState(
            createInitialEmergencyState
        );


    // ==================================================
    // LOCATION
    // ==================================================

    const [currentLocation, setCurrentLocation] =
        useState(null);


    const [locationLoading, setLocationLoading] =
        useState(false);


    const [locationError, setLocationError] =
        useState("");


    // ==================================================
    // VOICE
    // ==================================================

    const [recording, setRecording] =
        useState(false);


    const [voiceReady, setVoiceReady] =
        useState(false);


    // ==================================================
    // SPEAKING
    // ==================================================

    const [speakingMessageIndex, setSpeakingMessageIndex] =
        useState(null);


    // ==================================================
    // REFS
    // ==================================================

    const messagesEndRef =
        useRef(null);


    const voiceSocketRef =
        useRef(null);


    // ==================================================
    // AUTO SCROLL
    // ==================================================

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [
        messages,
        loading
    ]);


    // ==================================================
    // CLEANUP
    // ==================================================

    useEffect(() => {

        return () => {

            stopVoice();

            stopVoiceRecorder();

            stopBase64Audio();

        };

    }, []);


    // ==================================================
    // GET LOCATION
    // ==================================================

    const requestLocation = () => {

        if (locationLoading) {
            return;
        }


        setLocationError("");
        setLocationLoading(true);


        if (!navigator.geolocation) {

            setLocationLoading(false);

            setLocationError(
                "Location is not supported by this browser."
            );

            return;
        }


        const handleSuccess = (
            position
        ) => {

            const location = {

                latitude:
                    position.coords.latitude,

                longitude:
                    position.coords.longitude,

                accuracy:
                    position.coords.accuracy
            };


            console.log(
                "📍 QuickAid location received:",
                location
            );


            setCurrentLocation(
                location
            );


            setEmergencyState(
                (previous) => ({

                    ...previous,

                    locationAvailable:
                        true,

                    locationText:
                        "Current location available"
                })
            );


            setLocationError("");

            setLocationLoading(false);
        };


        const handleFailure = (
            geoError
        ) => {

            console.error(
                "📍 Location error:",
                geoError
            );


            setLocationLoading(false);


            switch (
            geoError.code
            ) {

                case 1:

                    setLocationError(
                        "Location permission was denied. Please allow location access for this site in your browser."
                    );

                    break;


                case 2:

                    setLocationError(
                        "Your device could not determine your location. Please enable Windows Location Services and try again."
                    );

                    break;


                case 3:

                    setLocationError(
                        "Location request timed out. Please try Enable again."
                    );

                    break;


                default:

                    setLocationError(
                        "Unable to get your current location."
                    );
            }
        };


        // ==================================================
        // FIRST ATTEMPT
        // ==================================================

        navigator.geolocation.getCurrentPosition(

            handleSuccess,

            (firstError) => {

                console.warn(
                    "📍 First location attempt failed:",
                    firstError
                );


                // ==================================================
                // RETRY
                // ==================================================

                navigator.geolocation.getCurrentPosition(

                    handleSuccess,

                    handleFailure,

                    {
                        enableHighAccuracy:
                            true,

                        timeout:
                            30000,

                        maximumAge:
                            0
                    }
                );
            },

            {
                enableHighAccuracy:
                    false,

                timeout:
                    15000,

                maximumAge:
                    60000
            }
        );
    };


    // ==================================================
    // AUTO REQUEST LOCATION
    // ==================================================

    useEffect(() => {

        if (
            !isOpen ||
            mode !== "emergency" ||
            currentLocation ||
            locationLoading
        ) {
            return;
        }


        requestLocation();

    }, [
        isOpen,
        mode
    ]);


    // ==================================================
    // OPEN
    // ==================================================

    const handleOpen = () => {

        setIsOpen(true);
    };


    // ==================================================
    // CLOSE
    // ==================================================

    const handleClose = () => {

        if (recording) {
            stopVoiceRecording();
        }


        setIsOpen(false);
    };


    // ==================================================
    // NEW CHAT
    // ==================================================

    const handleNewChat = () => {

        if (loading) {
            return;
        }


        stopBase64Audio();


        if (recording) {
            stopVoiceRecording();
        }


        setMessages([]);

        setMessage("");

        setError("");

        setConversationLanguage(null);

        setCurrentLocation(null);

        setLocationError("");

        setEmergencyState(
            createInitialEmergencyState()
        );


        setSessionId(
            createSessionId()
        );


        setMode("chat");
    };


    // ==================================================
    // CHANGE MODE
    // ==================================================

    const handleModeChange = (
        newMode
    ) => {

        if (loading) {
            return;
        }


        if (
            newMode === mode
        ) {
            return;
        }


        if (recording) {
            stopVoiceRecording();
        }


        stopBase64Audio();


        setMode(newMode);

        setMessages([]);

        setMessage("");

        setError("");

        setConversationLanguage(null);

        setEmergencyState(
            createInitialEmergencyState()
        );


        setSessionId(
            createSessionId()
        );


        setCurrentLocation(null);

        setLocationError("");
    };


    // ==================================================
    // SAVE MESSAGE
    // ==================================================

    const saveMessageToDatabase = async ({
        role,
        content
    }) => {

        try {

            await saveConversationMessage({

                sessionId,

                mode,

                language:
                    conversationLanguage ||
                    "en",

                role,

                content
            });

        } catch (saveError) {

            console.error(
                "Conversation save error:",
                saveError
            );
        }
    };


    // ==================================================
    // ADD MESSAGE
    // ==================================================

    const addMessage = ({
        role,
        content
    }) => {

        setMessages(
            (previousMessages) => [

                ...previousMessages,

                {
                    role,
                    content
                }
            ]
        );
    };


    // ==================================================
    // SPEAK
    // ==================================================

    const handleSpeak = async ({
        text,
        index
    }) => {

        if (!text) {
            return;
        }


        try {

            stopBase64Audio();


            setSpeakingMessageIndex(
                index
            );


            const result =
                await generateSpeech({

                    text,

                    language:
                        conversationLanguage ||
                        "en"
                });


            const audio =
                result?.data?.audio;


            if (!audio) {

                throw new Error(
                    "No audio returned by TTS"
                );
            }


            await playBase64Audio(
                audio
            );

        } catch (speechError) {

            console.error(
                "TTS error:",
                speechError
            );

        } finally {

            setSpeakingMessageIndex(
                null
            );
        }
    };


    // ==================================================
    // START VOICE
    // ==================================================

    const startVoiceRecording = async () => {

        if (
            loading ||
            recording
        ) {
            return;
        }


        setError("");


        try {

            const socket =
                connectVoice({

                    languageCode:
                        conversationLanguage
                            ? {
                                en: "en-IN",
                                hi: "hi-IN",
                                or: "od-IN",
                                pa: "pa-IN"
                            }[
                            conversationLanguage
                            ]
                            : "auto",

                    onReady: () => {

                        setVoiceReady(true);
                    },

                    onTranscript: (
                        data
                    ) => {

                        if (
                            data?.text
                        ) {

                            setMessage(
                                data.text
                            );
                        }
                    },

                    onError: (
                        data
                    ) => {

                        console.error(
                            "Voice error:",
                            data
                        );


                        setError(
                            data?.message ||
                            "Voice recognition error."
                        );


                        setVoiceReady(false);
                    },

                    onEnded: () => {

                        setVoiceReady(false);
                    }
                });


            voiceSocketRef.current =
                socket;


            await startVoiceRecorder({

                onAudio: (
                    audioData
                ) => {

                    sendVoiceAudio(
                        audioData
                    );
                },

                onError: (
                    recorderError
                ) => {

                    console.error(
                        "Recorder error:",
                        recorderError
                    );


                    setError(
                        recorderError.message ||
                        "Microphone error."
                    );


                    stopVoiceRecording();
                }
            });


            setRecording(true);

        } catch (voiceError) {

            console.error(
                "Start voice error:",
                voiceError
            );


            setError(
                voiceError.message ||
                "Unable to start microphone."
            );


            stopVoice();

            stopVoiceRecorder();

            setVoiceReady(false);

            setRecording(false);
        }
    };


    // ==================================================
    // STOP VOICE
    // ==================================================

    const stopVoiceRecording = () => {

        stopVoiceRecorder();

        stopVoice();

        voiceSocketRef.current =
            null;

        setVoiceReady(false);

        setRecording(false);
    };


    // ==================================================
    // MERGE AI EMERGENCY STATE
    // ==================================================
    //
    // IMPORTANT:
    //
    // Never blindly replace the previous state.
    //
    // Existing frontend values are preserved.
    //
    // ==================================================

    const mergeEmergencyState = ({
        aiConversation,
        userText,
        previousState
    }) => {

        const ai =
            aiConversation || {};


        // ==================================================
        // AI VALUES
        // ==================================================

        const aiName =
            normalizeText(
                ai.name
            );


        const aiMobile =
            normalizeMobile(
                ai.mobile
            );


        const aiDescription =
            normalizeText(
                ai.description
            );


        const aiEmergencyType =
            VALID_EMERGENCY_TYPES.includes(
                ai.emergencyType
            )
                ? ai.emergencyType
                : null;


        const aiSeverity =
            VALID_SEVERITIES.includes(
                ai.severity
            )
                ? ai.severity
                : null;


        // ==================================================
        // EXISTING VALUES
        // ==================================================

        let finalName =
            previousState.name ||
            aiName ||
            null;


        let finalMobile =
            previousState.mobile ||
            aiMobile ||
            null;


        let finalDescription =
            previousState.description ||
            aiDescription ||
            null;


        let finalEmergencyType =
            previousState.emergencyType ||
            aiEmergencyType ||
            null;


        let finalSeverity =
            previousState.severity ||
            aiSeverity ||
            null;


        // ==================================================
        // DETERMINISTIC FRONTEND FALLBACK
        // ==================================================
        //
        // If AI fails to extract a simple answer,
        // use the current step.
        //
        // This is what prevents:
        //
        // name → mobile → name again
        //
        // ==================================================

        const text =
            normalizeText(
                userText
            );


        const currentStep =
            previousState.step;


        if (
            text &&
            currentStep === "name" &&
            !finalName
        ) {

            // Don't treat a phone number as a name.
            if (
                !/^[6-9]\d{9}$/.test(
                    text.replace(/\D/g, "")
                )
            ) {

                finalName =
                    text;
            }
        }


        if (
            text &&
            currentStep === "mobile" &&
            !finalMobile
        ) {

            const mobile =
                normalizeMobile(
                    text
                );


            if (mobile) {

                finalMobile =
                    mobile;
            }
        }


        if (
            text &&
            currentStep === "description" &&
            !finalDescription
        ) {

            finalDescription =
                text;
        }


        // ==================================================
        // ACCIDENT CLASSIFICATION FALLBACK
        // ==================================================
        //
        // This is intentionally simple.
        // The AI remains the main classifier.
        //
        // ==================================================

        if (
            !finalEmergencyType &&
            text
        ) {

            const lowerText =
                text.toLowerCase();


            if (
                lowerText.includes("accident") ||
                lowerText.includes("crash") ||
                lowerText.includes("collision")
            ) {

                finalEmergencyType =
                    "accident";
            }
        }


        // ==================================================
        // CALCULATE LOCATION
        // ==================================================

        const locationAvailable =
            Boolean(
                currentLocation ||
                previousState.locationAvailable ||
                ai.locationAvailable
            );


        // ==================================================
        // CALCULATE NEXT STEP
        // ==================================================

        let nextStep =
            "name";


        if (!finalName) {

            nextStep =
                "name";

        } else if (!finalMobile) {

            nextStep =
                "mobile";

        } else if (!finalDescription) {

            nextStep =
                "description";

        } else if (!finalEmergencyType) {

            nextStep =
                "description";

        } else if (!locationAvailable) {

            nextStep =
                "location";

        } else {

            nextStep =
                "confirmation";
        }


        // ==================================================
        // CONFIRMATION
        // ==================================================

        const allInformationAvailable =
            Boolean(

                finalName &&
                finalMobile &&
                finalDescription &&
                finalEmergencyType &&
                locationAvailable

            );


        const confirmed =
            allInformationAvailable &&
            Boolean(
                ai.confirmed
            );


        // ==================================================
        // RETURN
        // ==================================================

        return {

            ...previousState,

            language:
                ai.language ||
                previousState.language ||
                null,

            name:
                finalName,

            mobile:
                finalMobile,

            description:
                finalDescription,

            emergencyType:
                finalEmergencyType,

            severity:
                finalSeverity,

            locationAvailable:
                locationAvailable,

            locationText:
                previousState.locationText ||
                ai.locationText ||
                null,

            confirmed,

            step:
                confirmed
                    ? "completed"
                    : nextStep
        };
    };


    // ==================================================
    // SEND MESSAGE
    // ==================================================

    const handleSend = async () => {

        const text =
            message.trim();


        if (
            !text ||
            loading
        ) {
            return;
        }


        setError("");


        // ==================================================
        // STOP RECORDING
        // ==================================================

        if (recording) {

            stopVoiceRecording();
        }


        // ==================================================
        // ADD USER MESSAGE
        // ==================================================

        addMessage({

            role: "user",

            content: text
        });


        // ==================================================
        // SAVE USER MESSAGE
        // ==================================================

        await saveMessageToDatabase({

            role: "user",

            content: text
        });


        setMessage("");

        setLoading(true);


        try {

            // ==================================================
            // BUILD REQUEST
            // ==================================================

            const requestData = {

                query: text,

                mode
            };


            // ==================================================
            // LANGUAGE
            // ==================================================

            if (
                conversationLanguage
            ) {

                requestData.language =
                    conversationLanguage;
            }


            // ==================================================
            // EMERGENCY
            // ==================================================

            if (
                mode === "emergency"
            ) {

                // ----------------------------------------------
                // IMPORTANT:
                //
                // Capture the CURRENT state at the beginning
                // of this request.
                // ----------------------------------------------

                const stateForRequest = {

                    ...emergencyState,

                    // Browser location is authoritative.
                    locationAvailable:
                        Boolean(
                            currentLocation ||
                            emergencyState.locationAvailable
                        )
                };


                requestData.conversation =
                    stateForRequest;


                if (
                    currentLocation
                ) {

                    requestData.location =
                        currentLocation;
                }


                if (
                    emergencyState.locationText
                ) {

                    requestData.city =
                        emergencyState.locationText;
                }


                console.log(
                    "🚨 QuickAid emergency request:",
                    requestData
                );
            }


            // ==================================================
            // AI
            // ==================================================

            const result =
                await askAI(
                    requestData
                );


            console.log(
                "🤖 QuickAid AI response:",
                result
            );


            // ==================================================
            // LANGUAGE
            // ==================================================

            if (
                result?.language
            ) {

                setConversationLanguage(
                    result.language
                );
            }


            // ==================================================
            // NORMAL CHAT
            // ==================================================

            if (
                mode === "chat"
            ) {

                const response =
                    result?.response ||
                    "Sorry, I could not generate a response.";


                addMessage({

                    role: "assistant",

                    content:
                        response
                });


                await saveMessageToDatabase({

                    role: "assistant",

                    content:
                        response
                });


                return;
            }


            // ==================================================
            // EMERGENCY
            // ==================================================

            if (
                mode === "emergency"
            ) {

                // ----------------------------------------------
                // MERGE RESPONSE
                // ----------------------------------------------

                if (
                    result?.conversation
                ) {

                    setEmergencyState(
                        (previousState) =>
                            mergeEmergencyState({

                                aiConversation:
                                    result.conversation,

                                userText:
                                    text,

                                previousState
                            })
                    );
                }


                // ----------------------------------------------
                // AI RESPONSE
                // ----------------------------------------------

                const response =
                    result?.response ||
                    "Please provide the required information.";


                addMessage({

                    role: "assistant",

                    content:
                        response
                });


                await saveMessageToDatabase({

                    role: "assistant",

                    content:
                        response
                });
            }

        } catch (requestError) {

            console.error(
                "❌ QuickAid AI Error:",
                requestError
            );


            setError(
                requestError.message ||
                "Unable to connect to QuickAid."
            );

        } finally {

            setLoading(false);
        }
    };


    // ==================================================
    // CONFIRM EMERGENCY
    // ==================================================

    const handleConfirmEmergency = async () => {

        if (loading) {
            return;
        }


        if (
            !emergencyState.name ||
            !emergencyState.mobile ||
            !emergencyState.description ||
            !emergencyState.emergencyType
        ) {

            setError(
                "Emergency information is incomplete."
            );

            return;
        }


        if (
            !currentLocation
        ) {

            setError(
                "Current location is required."
            );

            requestLocation();

            return;
        }


        setError("");

        setLoading(true);


        try {

            const emergencyData = {

                userName:
                    emergencyState.name,

                mobileNumber:
                    emergencyState.mobile,

                location:
                    currentLocation,

                description:
                    emergencyState.description,

                emergencyType:
                    emergencyState.emergencyType,

                severity:
                    emergencyState.severity ||
                    "medium"
            };


            console.log(
                "🚨 Creating emergency:",
                emergencyData
            );


            const result =
                await createEmergency(
                    emergencyData
                );


            console.log(
                "🚨 Emergency created:",
                result
            );


            const emergency =
                result?.data ||
                result?.emergency ||
                result;


            const emergencyId =
                emergency?.emergency_id ||
                result?.emergency_id ||
                null;


            const trackingToken =
                emergency?.tracking_token ||
                result?.tracking_token ||
                null;


            setEmergencyState(
                (previous) => ({

                    ...previous,

                    confirmed: true,

                    submitted: true,

                    emergencyId,

                    trackingToken,

                    step: "completed"
                })
            );


            const successMessage =
                emergencyId
                    ? `Emergency report created successfully. Emergency ID: ${emergencyId}`
                    : "Emergency report created successfully.";


            addMessage({

                role: "assistant",

                content:
                    successMessage
            });


            await saveMessageToDatabase({

                role: "assistant",

                content:
                    successMessage
            });

        } catch (submitError) {

            console.error(
                "Emergency submission error:",
                submitError
            );


            setError(
                submitError.message ||
                "Unable to create emergency report."
            );

        } finally {

            setLoading(false);
        }
    };


    // ==================================================
    // CANCEL EMERGENCY
    // ==================================================

    const handleCancelEmergency = () => {

        if (loading) {
            return;
        }


        setMode("chat");

        setMessages([]);

        setMessage("");

        setError("");

        setConversationLanguage(null);

        setCurrentLocation(null);

        setLocationError("");

        setEmergencyState(
            createInitialEmergencyState()
        );


        setSessionId(
            createSessionId()
        );
    };


    // ==================================================
    // ENTER KEY
    // ==================================================

    const handleKeyDown = (
        event
    ) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            handleSend();
        }
    };


    // ==================================================
    // EMERGENCY PROGRESS
    // ==================================================

    const getEmergencyProgress = () => {

        const state =
            emergencyState;


        return [

            {
                label: "Name",

                complete:
                    Boolean(state.name)
            },

            {
                label: "Mobile",

                complete:
                    Boolean(state.mobile)
            },

            {
                label: "Details",

                complete:
                    Boolean(state.description)
            },

            {
                label: "Type",

                complete:
                    Boolean(state.emergencyType)
            },

            {
                label: "Location",

                complete:
                    Boolean(
                        state.locationAvailable
                    )
            },

            {
                label: "Confirm",

                complete:
                    Boolean(
                        state.confirmed
                    )
            }

        ];
    };


    // ==================================================
    // FLOATING BUTTON
    // ==================================================

    if (!isOpen) {

        return (

            <button
                type="button"
                onClick={handleOpen}
                aria-label="Open QuickAid assistant"
                className="fixed bottom-6 right-6 z-[9999] flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl transition hover:scale-105 hover:bg-red-700"
            >

                <MessageCircle
                    size={28}
                />

            </button>
        );
    }


    // ==================================================
    // MAIN CHAT
    // ==================================================

    return (

        <div
            className="fixed bottom-4 right-4 z-[9999] flex h-[min(720px,calc(100vh-32px))] w-[min(420px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >

            {/* ==================================================
                HEADER
            ================================================== */}

            <header
                className={
                    mode === "emergency"
                        ? "shrink-0 border-b border-red-200 bg-red-600 px-4 py-4 text-white"
                        : "shrink-0 border-b border-slate-200 bg-white px-4 py-4"
                }
            >

                <div className="flex items-center justify-between gap-3">

                    <div className="flex min-w-0 items-center gap-3">

                        <div
                            className={
                                mode === "emergency"
                                    ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20"
                                    : "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600"
                            }
                        >

                            {mode === "emergency"
                                ? (
                                    <AlertTriangle
                                        size={21}
                                    />
                                )
                                : (
                                    <MessageCircle
                                        size={21}
                                    />
                                )
                            }

                        </div>


                        <div className="min-w-0">

                            <h2
                                className={
                                    mode === "emergency"
                                        ? "truncate text-base font-bold"
                                        : "truncate text-base font-bold text-slate-800"
                                }
                            >
                                QuickAid
                            </h2>


                            <p
                                className={
                                    mode === "emergency"
                                        ? "text-xs text-red-100"
                                        : "text-xs text-slate-500"
                                }
                            >

                                {mode === "emergency"
                                    ? "Emergency assistance"
                                    : "AI assistant"
                                }

                            </p>

                        </div>

                    </div>


                    <div className="flex shrink-0 items-center gap-1">

                        <button
                            type="button"
                            onClick={handleNewChat}
                            disabled={loading}
                            title="New conversation"
                            className={
                                mode === "emergency"
                                    ? "rounded-lg p-2 text-white transition hover:bg-white/10 disabled:opacity-50"
                                    : "rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
                            }
                        >

                            <Plus
                                size={18}
                            />

                        </button>


                        <button
                            type="button"
                            onClick={handleClose}
                            title="Close"
                            className={
                                mode === "emergency"
                                    ? "rounded-lg p-2 text-white transition hover:bg-white/10"
                                    : "rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                            }
                        >

                            <X
                                size={20}
                            />

                        </button>

                    </div>

                </div>

            </header>


            {/* ==================================================
                MODE SWITCH
            ================================================== */}

            <div className="shrink-0 border-b border-slate-200 bg-slate-50 p-2">

                <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-200 p-1">

                    <button
                        type="button"
                        onClick={() =>
                            handleModeChange("chat")
                        }
                        disabled={loading}
                        className={`rounded-md px-3 py-2 text-xs font-semibold transition ${mode === "chat"
                                ? "bg-white text-slate-800 shadow-sm"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                    >

                        Normal Chat

                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            handleModeChange("emergency")
                        }
                        disabled={loading}
                        className={`rounded-md px-3 py-2 text-xs font-semibold transition ${mode === "emergency"
                                ? "bg-red-600 text-white shadow-sm"
                                : "text-slate-500 hover:text-red-600"
                            }`}
                    >

                        Emergency

                    </button>

                </div>

            </div>


            {/* ==================================================
                LOCATION
            ================================================== */}

            {mode === "emergency" && (

                <div className="shrink-0 border-b border-red-100 bg-red-50 px-3 py-2">

                    <div className="flex items-center justify-between gap-2">

                        <div className="flex min-w-0 items-center gap-2">

                            <MapPin
                                size={16}
                                className={
                                    emergencyState.locationAvailable
                                        ? "shrink-0 text-green-600"
                                        : "shrink-0 text-red-600"
                                }
                            />


                            <span className="truncate text-xs text-slate-600">

                                {emergencyState.locationAvailable
                                    ? "Location available"
                                    : locationLoading
                                        ? "Getting your location..."
                                        : "Location required"
                                }

                            </span>

                        </div>


                        {!emergencyState.locationAvailable && (

                            <button
                                type="button"
                                onClick={requestLocation}
                                disabled={locationLoading}
                                className="shrink-0 rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            >

                                {locationLoading
                                    ? "Getting..."
                                    : "Enable"
                                }

                            </button>

                        )}

                    </div>


                    {locationError && (

                        <p className="mt-1 text-xs text-red-600">

                            {locationError}

                        </p>

                    )}

                </div>

            )}


            {/* ==================================================
                PROGRESS
            ================================================== */}

            {mode === "emergency" && (

                <div className="shrink-0 border-b border-slate-200 bg-white px-3 py-2">

                    <div className="flex items-center justify-between gap-1">

                        {getEmergencyProgress().map(
                            (item) => (

                                <div
                                    key={item.label}
                                    className="flex min-w-0 flex-1 flex-col items-center gap-1"
                                >

                                    <div
                                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${item.complete
                                                ? "bg-green-600 text-white"
                                                : "bg-slate-200 text-slate-500"
                                            }`}
                                    >

                                        {item.complete
                                            ? "✓"
                                            : "•"
                                        }

                                    </div>


                                    <span className="truncate text-[9px] text-slate-500">

                                        {item.label}

                                    </span>

                                </div>

                            )
                        )}

                    </div>

                </div>

            )}


            {/* ==================================================
                MESSAGES
            ================================================== */}

            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-3 py-4">

                {messages.length === 0 ? (

                    <div className="flex h-full items-center justify-center px-6 text-center">

                        <div>

                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">

                                {mode === "emergency"
                                    ? (
                                        <AlertTriangle
                                            size={23}
                                        />
                                    )
                                    : (
                                        <MessageCircle
                                            size={23}
                                        />
                                    )
                                }

                            </div>


                            <h3 className="text-sm font-semibold text-slate-700">

                                {mode === "emergency"
                                    ? "Emergency assistance"
                                    : "How can I help?"
                                }

                            </h3>


                            <p className="mt-1 text-xs leading-5 text-slate-500">

                                {mode === "emergency"
                                    ? "Tell me what happened. You can provide multiple details in one message."
                                    : "Talk naturally. I will respond in the language you use."
                                }

                            </p>

                        </div>

                    </div>

                ) : (

                    <div className="space-y-3">

                        {messages.map(
                            (item, index) => (

                                <div
                                    key={`${index}-${item.role}`}
                                    className={
                                        item.role === "user"
                                            ? "flex justify-end"
                                            : "flex justify-start"
                                    }
                                >

                                    <div className="max-w-[85%]">

                                        <div
                                            className={
                                                item.role === "user"
                                                    ? "rounded-2xl rounded-br-md bg-slate-800 px-3 py-2.5 text-sm leading-5 text-white"
                                                    : "rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3 py-2.5 text-sm leading-5 text-slate-800 shadow-sm"
                                            }
                                        >

                                            {item.content}

                                        </div>


                                        {item.role === "assistant" && (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSpeak({
                                                        text:
                                                            item.content,

                                                        index
                                                    })
                                                }
                                                disabled={
                                                    speakingMessageIndex === index
                                                }
                                                title="Listen"
                                                className="mt-1 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 disabled:opacity-50"
                                            >

                                                {speakingMessageIndex === index
                                                    ? (
                                                        <Loader2
                                                            size={14}
                                                            className="animate-spin"
                                                        />
                                                    )
                                                    : (
                                                        <Volume2
                                                            size={14}
                                                        />
                                                    )
                                                }

                                            </button>

                                        )}

                                    </div>

                                </div>

                            )
                        )}


                        {loading && (

                            <div className="flex justify-start">

                                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-500">

                                    <Loader2
                                        size={14}
                                        className="animate-spin"
                                    />

                                    QuickAid is thinking...

                                </div>

                            </div>

                        )}


                        <div
                            ref={messagesEndRef}
                        />

                    </div>

                )}

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <div className="shrink-0 border-t border-red-200 bg-red-50 px-3 py-2">

                    <p className="text-xs text-red-600">

                        {error}

                    </p>

                </div>

            )}


            {/* ==================================================
                SUBMITTED
            ================================================== */}

            {mode === "emergency" &&
                emergencyState.submitted && (

                    <div className="shrink-0 border-t border-green-200 bg-green-50 px-3 py-3">

                        <div className="flex items-start gap-2">

                            <CheckCircle2
                                size={18}
                                className="mt-0.5 shrink-0 text-green-600"
                            />


                            <div className="min-w-0">

                                <p className="text-sm font-semibold text-green-800">

                                    Emergency report created

                                </p>


                                {emergencyState.emergencyId && (

                                    <p className="mt-1 text-xs text-green-700">

                                        ID:{" "}
                                        {emergencyState.emergencyId}

                                    </p>

                                )}

                            </div>

                        </div>

                    </div>

                )}


            {/* ==================================================
                CONFIRMATION
            ================================================== */}

            {mode === "emergency" &&
                !emergencyState.submitted &&
                emergencyState.name &&
                emergencyState.mobile &&
                emergencyState.description &&
                emergencyState.emergencyType &&
                emergencyState.locationAvailable && (

                    <div className="shrink-0 border-t border-amber-200 bg-amber-50 px-3 py-3">

                        <p className="text-xs font-semibold text-amber-800">

                            Emergency information is ready.

                        </p>


                        <p className="mt-1 text-xs text-amber-700">

                            Please confirm before creating the emergency report.

                        </p>


                        <div className="mt-2 grid grid-cols-2 gap-2">

                            <button
                                type="button"
                                onClick={
                                    handleConfirmEmergency
                                }
                                disabled={loading}
                                className="flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            >

                                <CheckCircle2
                                    size={14}
                                />

                                Confirm Emergency

                            </button>


                            <button
                                type="button"
                                disabled={loading}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >

                                Review

                            </button>

                        </div>

                    </div>

                )}


            {/* ==================================================
                CANCEL
            ================================================== */}

            {mode === "emergency" &&
                !emergencyState.submitted && (

                    <div className="shrink-0 border-t border-slate-200 bg-white px-3 py-2">

                        <button
                            type="button"
                            onClick={
                                handleCancelEmergency
                            }
                            disabled={loading}
                            className="w-full rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                        >

                            Cancel Emergency

                        </button>

                    </div>

                )}


            {/* ==================================================
                INPUT
            ================================================== */}

            {!emergencyState.submitted && (

                <div className="shrink-0 border-t border-slate-200 bg-white p-3">

                    <div className="flex items-center gap-2">

                        <button
                            type="button"
                            onClick={
                                recording
                                    ? stopVoiceRecording
                                    : startVoiceRecording
                            }
                            disabled={loading}
                            title={
                                recording
                                    ? "Stop microphone"
                                    : "Use microphone"
                            }
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${recording
                                    ? "bg-red-600 text-white hover:bg-red-700"
                                    : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                                } disabled:cursor-not-allowed disabled:opacity-50`}
                        >

                            {recording
                                ? (
                                    <MicOff
                                        size={18}
                                    />
                                )
                                : (
                                    <Mic
                                        size={18}
                                    />
                                )
                            }

                        </button>


                        <input
                            type="text"
                            value={message}
                            onChange={(event) =>
                                setMessage(
                                    event.target.value
                                )
                            }
                            onKeyDown={
                                handleKeyDown
                            }
                            disabled={loading}
                            placeholder={
                                mode === "emergency"
                                    ? "Tell me what happened..."
                                    : "Type your message..."
                            }
                            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100"
                        />


                        <button
                            type="button"
                            onClick={
                                handleSend
                            }
                            disabled={
                                !message.trim() ||
                                loading
                            }
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                            {loading
                                ? (
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />
                                )
                                : (
                                    <Send
                                        size={18}
                                    />
                                )
                            }

                        </button>

                    </div>


                    {recording && (

                        <div className="mt-2 flex items-center gap-2 text-xs text-red-600">

                            <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />

                            {voiceReady
                                ? "Listening..."
                                : "Connecting microphone..."
                            }

                        </div>

                    )}

                </div>

            )}

        </div>
    );
}


export default EmergencyChatbot;