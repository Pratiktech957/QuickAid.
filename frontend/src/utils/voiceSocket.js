import { io } from "socket.io-client";


// ==========================================================
// QuickAid Voice Socket
//
// Frontend
//    ↓
// Socket.IO
//    ↓
// Backend
//    ↓
// Sarvam Realtime STT
// ==========================================================

const SOCKET_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3001";

let socket = null;


// ==========================================================
// Connect Voice
// ==========================================================

export const connectVoice = ({
    languageCode = "auto",
    onReady,
    onTranscript,
    onError,
    onEnded
} = {}) => {

    // ------------------------------------------------------
    // Close previous socket
    // ------------------------------------------------------

    if (socket) {
        socket.disconnect();
        socket = null;
    }


    // ------------------------------------------------------
    // Create Socket.IO connection
    // ------------------------------------------------------

    socket = io(SOCKET_URL, {
        transports: ["websocket"]
    });


    // ======================================================
    // Connected
    // ======================================================

    socket.on("connect", () => {

        console.log(
            "🔗 Voice socket connected:",
            socket.id
        );


        // Start Sarvam voice session
        socket.emit(
            "voice-start",
            {
                languageCode
            }
        );
    });


    // ======================================================
    // Sarvam Ready
    // ======================================================

    socket.on(
        "voice-ready",
        (data) => {

            console.log(
                "🎤 Voice recognition ready"
            );

            if (onReady) {
                onReady(data);
            }
        }
    );


    // ======================================================
    // Transcript
    // ======================================================

    socket.on(
        "voice-transcript",
        (data) => {

            if (onTranscript) {
                onTranscript(data);
            }
        }
    );


    // ======================================================
    // Voice Error
    // ======================================================

    socket.on(
        "voice-error",
        (data) => {

            console.error(
                "❌ Voice socket error:",
                data
            );

            if (onError) {
                onError(data);
            }
        }
    );


    // ======================================================
    // Voice Ended
    // ======================================================

    socket.on(
        "voice-ended",
        () => {

            console.log(
                "🛑 Voice session ended"
            );

            if (onEnded) {
                onEnded();
            }
        }
    );


    // ======================================================
    // Socket Disconnect
    // ======================================================

    socket.on(
        "disconnect",
        (reason) => {

            console.log(
                "🔌 Voice socket disconnected:",
                reason
            );
        }
    );


    return socket;
};


// ==========================================================
// Send Voice Audio
// ==========================================================

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

        return;
    }


    if (
        typeof audioData !== "string" ||
        !audioData
    ) {

        console.warn(
            "⚠️ Invalid voice audio data"
        );

        return;
    }


    socket.emit(
        "voice-audio",
        audioData
    );
};


// ==========================================================
// Stop Voice
// ==========================================================

export const stopVoice = () => {

    if (!socket) {
        return;
    }


    // Tell backend to close
    // Sarvam realtime connection

    socket.emit(
        "voice-stop"
    );


    // Close Socket.IO connection

    socket.disconnect();

    socket = null;


    console.log(
        "🛑 QuickAid voice stopped"
    );
};


// ==========================================================
// Get Current Socket
// ==========================================================

export const getVoiceSocket = () => {

    return socket;
};