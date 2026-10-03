const {
    textToSpeech
} = require("../../services/sarvam/textToSpeech.service");

const generateSpeech = async (req, res) => {

    try {

        const {
            text,
            language,
            speaker,
            pace,
            temperature
        } = req.body;

        if (
            typeof text !== "string" ||
            !text.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Text is required"
            });
        }

        const result = await textToSpeech({
            text,
            language: language || "en",
            speaker,
            pace,
            temperature
        });

        return res.status(200).json({

            success: true,

            message: "Speech generated successfully",

            data: {
                audio: result.audio,
                audioFormat: result.audioFormat,
                sampleRate: result.sampleRate,
                languageCode: result.languageCode,
                model: result.model,
                speaker: result.speaker
            }
        });

    } catch (error) {

        console.error(
            "❌ TTS controller error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to generate speech"
        });
    }
};

module.exports = {
    generateSpeech
};