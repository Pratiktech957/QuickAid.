import api from "./api";


// ======================================================
// SAVE CONVERSATION MESSAGE
// ======================================================

export const saveConversationMessage = async ({
    sessionId,
    mode,
    language,
    role,
    content
}) => {

    return await api(
        "/api/conversations/message",
        {
            method: "POST",

            body: JSON.stringify({

                session_id:
                    sessionId,

                mode,

                language,

                role,

                content
            })
        }
    );
};