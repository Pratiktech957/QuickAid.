import { io } from "socket.io-client";

// ======================================================
// SOCKET URL
// ======================================================

const SOCKET_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3001";


// ======================================================
// VOICE SOCKET
// ======================================================

let socket = null;


// ======================================================
// SUPPORTED LANGUAGE CODES
// ======================================================

const VALID_LANGUAGE_CODES = [
    "auto",
    "en-IN",
    "hi-IN",
    "od-IN",
    "pa-IN"
];


// ======================================================
// NORMALIZE LANGUAGE CODE
// ======================================================

const normalizeLanguageCode = (
    languageCode
) => {

    if (!languageCode) {
        return "auto";
    }

    const value =
        String(languageCode)
            .trim()
            .toLowerCase();


    if (
        value === "auto"
    ) {
        return "auto";
    }


    if (
        value === "en" ||
        value === "en-in" ||
        value === "english"
    ) {
        return "en-IN";
    }


    if (
        value === "hi" ||
        value === "hi-in" ||
        value === "hindi"
    ) {
        return "hi-IN";
    }


    if (
        value === "or" ||
        value === "od" ||
        value === "od-in" ||
        value === "odia" ||
        value === "oriya"
    ) {
        return "od-IN";
    }


    if (
        value === "pa" ||
        value === "pa-in" ||
        value === "punjabi"
    ) {
        return "pa-IN";
    }


    if (
        VALID_LANGUAGE_CODES.includes(
            languageCode
        )
    ) {
        return languageCode;
    }


    return "auto";
};


// ======================================================
// CONNECT VOICE SOCKET
// ======================================================

export const connectVoice = ({
    languageCode = "auto",
    onReady,
    onTranscript,
    onError,
    onEnded
} = {}) => {

    // ==================================================
    // CLOSE EXISTING CONNECTION
    // ==================================================

    if (socket) {

        socket.emit("voice-stop");

        socket.disconnect();

        socket = null;
    }


    // ==================================================
    // LANGUAGE
    // ==================================================

    const normalizedLanguageCode =
        normalizeLanguageCode(
            languageCode
        );


    // ==================================================
    // CREATE SOCKET
    // ==================================================

    socket = io(
        SOCKET_URL,
        {
            transports: ["websocket"]
        }
    );


    // ==================================================
    // SOCKET CONNECTED
    // ==================================================

    socket.on(
        "connect",
        () => {

            console.log(
                "🔗 Voice socket connected:",
                socket.id
            );


            socket.emit(
                "voice-start",
                {
                    languageCode:
                        normalizedLanguageCode
                }
            );
        }
    );


    // ==================================================
    // SARVAM READY
    // ==================================================

    socket.on(
        "voice-ready",
        (data) => {

            console.log(
                "🎤 Voice recognition ready"
            );


            onReady?.(data);
        }
    );


    // ==================================================
    // TRANSCRIPT
    // ==================================================

    socket.on(
        "voice-transcript",
        (data) => {

            onTranscript?.(data);
        }
    );


    // ==================================================
    // VOICE ERROR
    // ==================================================

    socket.on(
        "voice-error",
        (data) => {

            console.error(
                "❌ Voice socket error:",
                data
            );


            onError?.(data);
        }
    );


    // ==================================================
    // VOICE ENDED
    // ==================================================

    socket.on(
        "voice-ended",
        () => {

            onEnded?.();
        }
    );


    // ==================================================
    // SOCKET CONNECTION ERROR
    // ==================================================

    socket.on(
        "connect_error",
        (error) => {

            console.error(
                "❌ Voice Socket.IO connection error:",
                error.message
            );


            onError?.({
                message:
                    error.message
            });
        }
    );


    // ==================================================
    // RETURN SOCKET
    // ==================================================

    return socket;
};


// ======================================================
// SEND VOICE AUDIO
// ======================================================

export const sendVoiceAudio = (
    audioData
) => {

    if (
        !socket ||
        !socket.connected
    ) {

        console.warn(
            "⚠️ Voice socket is not connected"
        );

        return false;
    }


    if (!audioData) {

        console.warn(
            "⚠️ Voice audio data is empty"
        );

        return false;
    }


    socket.emit(
        "voice-audio",
        audioData
    );


    return true;
};


// ======================================================
// STOP VOICE
// ======================================================

export const stopVoice = () => {

    if (!socket) {
        return;
    }


    // Tell backend to stop Sarvam session
    socket.emit(
        "voice-stop"
    );


    // Disconnect Socket.IO
    socket.disconnect();


    // Clear reference
    socket = null;
};


// ======================================================
// GET VOICE SOCKET
// ======================================================

export const getVoiceSocket = () => {

    return socket;
};