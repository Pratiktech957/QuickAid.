const {
    createSpeechToTextConnection
} = require("../services/sarvam/speechToText.service");

// ==========================================
// Voice Socket
// Frontend ↔ Backend ↔ Sarvam Realtime STT
// ==========================================

const registerVoiceSocket = (io, socket) => {

    let sarvamSocket = null;

    // ==========================================
    // Start Voice Session
    // ==========================================

    socket.on("voice-start", (data = {}) => {

        try {

            // --------------------------------------
            // Close previous Sarvam connection
            // --------------------------------------

            if (
                sarvamSocket &&
                (
                    sarvamSocket.readyState === 0 ||
                    sarvamSocket.readyState === 1
                )
            ) {
                sarvamSocket.close();
            }

            sarvamSocket = null;


            // --------------------------------------
            // Language
            // --------------------------------------

            const languageCode =
                data.languageCode || "auto";


            // --------------------------------------
            // Create Sarvam connection
            // --------------------------------------

            sarvamSocket =
                createSpeechToTextConnection({
                    languageCode
                });


            // ==========================================
            // Sarvam Connected
            // ==========================================

            sarvamSocket.on("open", () => {

                console.log(
                    `🎤 Sarvam STT connected for ${socket.id}`
                );

                socket.emit(
                    "voice-ready",
                    {
                        success: true
                    }
                );
            });


            // ==========================================
            // Sarvam Messages
            // ==========================================

            sarvamSocket.on(
                "message",
                (message) => {

                    try {

                        const data =
                            JSON.parse(
                                message.toString()
                            );


                        console.log(
                            "🎤 Sarvam event:",
                            data.event
                        );


                        // ----------------------------------
                        // Forward everything to frontend
                        // ----------------------------------

                        socket.emit(
                            "voice-transcript",
                            data
                        );

                    } catch (error) {

                        console.error(
                            "❌ Sarvam message parse error:",
                            error
                        );
                    }
                }
            );


            // ==========================================
            // Sarvam Error
            // ==========================================

            sarvamSocket.on(
                "error",
                (error) => {

                    console.error(
                        "❌ Sarvam WebSocket error:",
                        error
                    );

                    socket.emit(
                        "voice-error",
                        {
                            success: false,
                            message:
                                "Speech recognition service error"
                        }
                    );
                }
            );


            // ==========================================
            // Sarvam Closed
            // ==========================================

            sarvamSocket.on(
                "close",
                (code, reason) => {

                    console.log(
                        `🎤 Sarvam STT disconnected for ${socket.id}`
                    );

                    console.log(
                        "Close code:",
                        code
                    );

                    if (reason) {
                        console.log(
                            "Close reason:",
                            reason.toString()
                        );
                    }

                    socket.emit(
                        "voice-ended"
                    );

                    sarvamSocket = null;
                }
            );

        } catch (error) {

            console.error(
                "❌ Voice session error:",
                error
            );

            socket.emit(
                "voice-error",
                {
                    success: false,
                    message:
                        error.message ||
                        "Unable to start voice recognition"
                }
            );
        }
    });


    // ==========================================
    // Audio From Frontend
    // ==========================================

    socket.on(
        "voice-audio",
        (audioData) => {

            // --------------------------------------
            // Check Sarvam connection
            // --------------------------------------

            if (
                !sarvamSocket ||
                sarvamSocket.readyState !== 1
            ) {

                console.warn(
                    "⚠️ Sarvam STT is not connected"
                );

                return;
            }


            // --------------------------------------
            // Validate audio
            // --------------------------------------

            if (
                typeof audioData !== "string" ||
                !audioData
            ) {

                console.warn(
                    "⚠️ Invalid voice audio data"
                );

                return;
            }


            // ======================================
            // Send audio to Sarvam Realtime STT
            // ======================================

            try {

                sarvamSocket.send(
                    JSON.stringify({
                        event: "audio_input",
                        audio: audioData
                    })
                );

            } catch (error) {

                console.error(
                    "❌ Voice audio forwarding error:",
                    error
                );

                socket.emit(
                    "voice-error",
                    {
                        success: false,
                        message:
                            "Unable to send audio to speech recognition service"
                    }
                );
            }
        }
    );


    // ==========================================
    // Stop Voice Session
    // ==========================================

    socket.on(
        "voice-stop",
        () => {

            try {

                if (
                    sarvamSocket &&
                    (
                        sarvamSocket.readyState === 0 ||
                        sarvamSocket.readyState === 1
                    )
                ) {

                    sarvamSocket.close();
                }

            } catch (error) {

                console.error(
                    "❌ Error closing Sarvam connection:",
                    error
                );
            }

            sarvamSocket = null;

            console.log(
                `🛑 Voice session stopped: ${socket.id}`
            );
        }
    );


    // ==========================================
    // Client Disconnect
    // ==========================================

    socket.on(
        "disconnect",
        () => {

            try {

                if (
                    sarvamSocket &&
                    (
                        sarvamSocket.readyState === 0 ||
                        sarvamSocket.readyState === 1
                    )
                ) {

                    sarvamSocket.close();
                }

            } catch (error) {

                console.error(
                    "❌ Error closing Sarvam connection:",
                    error
                );
            }

            sarvamSocket = null;

            console.log(
                `🔌 Voice socket cleaned up: ${socket.id}`
            );
        }
    );
};


// ==========================================
// Export
// ==========================================

module.exports = {
    registerVoiceSocket
};