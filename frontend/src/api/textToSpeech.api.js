import api from "./api";

// ======================================================
// GENERATE SPEECH
// ======================================================

export const generateSpeech = async ({
    text,
    language = "en",
    speaker,
    pace,
    temperature
}) => {

    return await api("/api/ai/tts", {

        method: "POST",

        body: JSON.stringify({
            text,
            language,
            speaker,
            pace,
            temperature
        })

    });
};