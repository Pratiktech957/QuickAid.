import { sendVoiceAudio } from "./voiceSocket";


// ==========================================================
// QuickAid Voice Recorder
//
// Browser Microphone
//      ↓
// Float32 PCM
//      ↓
// Resample to 16 kHz
//      ↓
// Int16 PCM
//      ↓
// Base64
//      ↓
// voiceSocket.js
//      ↓
// Socket.IO
//      ↓
// Backend
//      ↓
// Sarvam Realtime STT
// ==========================================================


let audioContext = null;
let mediaStream = null;
let sourceNode = null;
let processorNode = null;
let silentGainNode = null;


// ==========================================================
// Constants
// ==========================================================

const TARGET_SAMPLE_RATE = 16000;

const PROCESSOR_BUFFER_SIZE = 4096;


// ==========================================================
// Float32 → Int16 PCM
// ==========================================================

const float32ToInt16 = (input) => {

    const output =
        new Int16Array(input.length);


    for (
        let i = 0;
        i < input.length;
        i++
    ) {

        const sample =
            Math.max(
                -1,
                Math.min(
                    1,
                    input[i]
                )
            );


        output[i] =
            sample < 0
                ? sample * 0x8000
                : sample * 0x7fff;
    }


    return output;
};


// ==========================================================
// Resample Audio → 16 kHz
// ==========================================================

const resampleAudio = (
    input,
    inputSampleRate,
    outputSampleRate
) => {

    // No conversion required
    if (
        inputSampleRate ===
        outputSampleRate
    ) {
        return input;
    }


    const ratio =
        inputSampleRate /
        outputSampleRate;


    const outputLength =
        Math.floor(
            input.length / ratio
        );


    const output =
        new Float32Array(
            outputLength
        );


    for (
        let i = 0;
        i < outputLength;
        i++
    ) {

        const position =
            i * ratio;


        const index =
            Math.floor(position);


        const nextIndex =
            Math.min(
                index + 1,
                input.length - 1
            );


        const fraction =
            position - index;


        output[i] =
            input[index] *
            (1 - fraction) +
            input[nextIndex] *
            fraction;
    }


    return output;
};


// ==========================================================
// Int16 PCM → Base64
// ==========================================================

const int16ToBase64 = (pcm) => {

    const bytes =
        new Uint8Array(
            pcm.buffer,
            pcm.byteOffset,
            pcm.byteLength
        );


    let binary = "";


    const chunkSize = 0x8000;


    for (
        let i = 0;
        i < bytes.length;
        i += chunkSize
    ) {

        const chunk =
            bytes.subarray(
                i,
                Math.min(
                    i + chunkSize,
                    bytes.length
                )
            );


        binary += String.fromCharCode(
            ...chunk
        );
    }


    return btoa(binary);
};


// ==========================================================
// Start Voice Recording
// ==========================================================

export const startVoiceRecorder = async ({
    onError
} = {}) => {

    // ------------------------------------------------------
    // Prevent duplicate recording
    // ------------------------------------------------------

    if (mediaStream) {

        console.warn(
            "🎤 Voice recorder is already running"
        );

        return;
    }


    // ------------------------------------------------------
    // Browser microphone support
    // ------------------------------------------------------

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        const error =
            new Error(
                "Microphone access is not supported by this browser."
            );


        if (onError) {
            onError(error);
        }


        throw error;
    }


    // ======================================================
    // Request Microphone
    // ======================================================

    try {

        mediaStream =
            await navigator.mediaDevices.getUserMedia(
                {
                    audio: {
                        channelCount: 1,
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                }
            );

    } catch (error) {

        console.error(
            "🎤 Microphone permission error:",
            error
        );


        mediaStream = null;


        const microphoneError =
            new Error(
                "Microphone permission was denied or the microphone is unavailable."
            );


        if (onError) {
            onError(microphoneError);
        }


        throw microphoneError;
    }


    // ======================================================
    // Create Audio Context
    // ======================================================

    try {

        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContextClass) {

            throw new Error(
                "Web Audio API is not supported by this browser."
            );
        }


        audioContext =
            new AudioContextClass();


        if (
            audioContext.state ===
            "suspended"
        ) {

            await audioContext.resume();
        }


        const inputSampleRate =
            audioContext.sampleRate;


        console.log(
            "🎤 Browser sample rate:",
            inputSampleRate
        );


        console.log(
            "🎤 Target sample rate:",
            TARGET_SAMPLE_RATE
        );


        // ==================================================
        // Microphone Source
        // ==================================================

        sourceNode =
            audioContext.createMediaStreamSource(
                mediaStream
            );


        // ==================================================
        // Script Processor
        //
        // AudioWorklet is better for production,
        // but ScriptProcessorNode keeps compatibility
        // with the current QuickAid implementation.
        // ==================================================

        processorNode =
            audioContext.createScriptProcessor(
                PROCESSOR_BUFFER_SIZE,
                1,
                1
            );


        // ==================================================
        // Process Microphone Audio
        // ==================================================

        processorNode.onaudioprocess =
            (event) => {

                try {

                    const input =
                        event.inputBuffer.getChannelData(
                            0
                        );


                    // --------------------------------------
                    // Resample → 16 kHz
                    // --------------------------------------

                    const resampled =
                        resampleAudio(
                            input,
                            inputSampleRate,
                            TARGET_SAMPLE_RATE
                        );


                    // --------------------------------------
                    // Float32 → Int16 PCM
                    // --------------------------------------

                    const pcm =
                        float32ToInt16(
                            resampled
                        );


                    if (
                        pcm.length === 0
                    ) {
                        return;
                    }


                    // --------------------------------------
                    // Int16 PCM → Base64
                    // --------------------------------------

                    const base64 =
                        int16ToBase64(
                            pcm
                        );


                    // --------------------------------------
                    // Send to voiceSocket.js
                    // --------------------------------------

                    sendVoiceAudio(
                        base64
                    );

                } catch (error) {

                    console.error(
                        "🎤 Audio processing error:",
                        error
                    );


                    if (onError) {
                        onError(error);
                    }
                }
            };


        // ==================================================
        // Connect Audio Nodes
        // ==================================================

        sourceNode.connect(
            processorNode
        );


        // ==================================================
        // Silent Output
        //
        // The processor needs an output connection in
        // many browsers to remain active.
        //
        // Gain = 0 means microphone audio is NOT played
        // back to the user.
        // ==================================================

        silentGainNode =
            audioContext.createGain();


        silentGainNode.gain.value = 0;


        processorNode.connect(
            silentGainNode
        );


        silentGainNode.connect(
            audioContext.destination
        );


        console.log(
            "🎤 QuickAid microphone recording started"
        );

    } catch (error) {

        console.error(
            "❌ Failed to start audio recorder:",
            error
        );


        // Clean up microphone if AudioContext fails

        if (mediaStream) {

            mediaStream
                .getTracks()
                .forEach(
                    (track) => {
                        track.stop();
                    }
                );

            mediaStream = null;
        }


        if (audioContext) {

            audioContext
                .close()
                .catch(() => { });

            audioContext = null;
        }


        if (onError) {
            onError(error);
        }


        throw error;
    }
};


// ==========================================================
// Stop Voice Recording
// ==========================================================

export const stopVoiceRecorder = () => {

    // ------------------------------------------------------
    // Processor
    // ------------------------------------------------------

    if (processorNode) {

        processorNode.disconnect();

        processorNode.onaudioprocess =
            null;

        processorNode = null;
    }


    // ------------------------------------------------------
    // Silent Gain
    // ------------------------------------------------------

    if (silentGainNode) {

        silentGainNode.disconnect();

        silentGainNode = null;
    }


    // ------------------------------------------------------
    // Source
    // ------------------------------------------------------

    if (sourceNode) {

        sourceNode.disconnect();

        sourceNode = null;
    }


    // ------------------------------------------------------
    // Microphone
    // ------------------------------------------------------

    if (mediaStream) {

        mediaStream
            .getTracks()
            .forEach(
                (track) => {
                    track.stop();
                }
            );

        mediaStream = null;
    }


    // ------------------------------------------------------
    // Audio Context
    // ------------------------------------------------------

    if (audioContext) {

        audioContext
            .close()
            .catch(() => { });

        audioContext = null;
    }


    console.log(
        "🛑 QuickAid microphone recording stopped"
    );
};


// ==========================================================
// Microphone Availability
// ==========================================================

export const isMicrophoneAvailable = () => {

    return Boolean(
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia
    );
};


// ==========================================================
// Recording Status
// ==========================================================

export const isVoiceRecording = () => {

    return Boolean(
        mediaStream
    );
};