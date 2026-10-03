const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
    {
        session_id: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },

        mode: {
            type: String,
            enum: ["chat", "emergency"],
            required: true,
            default: "chat"
        },

        language: {
            type: String,
            enum: ["en", "hi", "or", "pa"],
            default: "en"
        },

        messages: [
            {
                role: {
                    type: String,
                    enum: ["user", "assistant"],
                    required: true
                },

                content: {
                    type: String,
                    required: true,
                    trim: true
                },

                created_at: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },

    {
        timestamps: true
    }
);

// ======================================================
// INDEXES
// ======================================================

conversationSchema.index({ mode: 1 });
conversationSchema.index({ updatedAt: -1 });

// ======================================================
// MODEL
// ======================================================

module.exports = mongoose.model(
    "Conversation",
    conversationSchema
);