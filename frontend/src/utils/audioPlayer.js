let currentAudio = null;


// ==========================================
// Play Base64 WAV Audio
// ==========================================

export const playBase64Audio = (base64Audio) => {
    return new Promise((resolve, reject) => {

        if (!base64Audio) {
            reject(new Error("Audio data is missing"));
            return;
        }

        try {

            // Stop previous audio
            stopBase64Audio();

            const audio = new Audio(
                `data:audio/wav;base64,${base64Audio}`
            );

            currentAudio = audio;

            audio.onended = () => {

                currentAudio = null;

                resolve();
            };

            audio.onerror = () => {

                currentAudio = null;

                reject(
                    new Error("Failed to play audio")
                );
            };

            audio.play().catch((error) => {

                currentAudio = null;

                reject(error);
            });

        } catch (error) {

            currentAudio = null;

            reject(error);
        }
    });
};


// ==========================================
// Stop Current Audio
// ==========================================

export const stopBase64Audio = () => {

    if (!currentAudio) {
        return;
    }

    currentAudio.pause();

    currentAudio.currentTime = 0;

    currentAudio.onended = null;
    currentAudio.onerror = null;

    currentAudio = null;
};