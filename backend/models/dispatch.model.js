const mongoose = require("mongoose");

const dispatchSchema = new mongoose.Schema(
    {
        emergency_id: {
            type: String,
            required: true,
            trim: true
        },

        unit_id: {
            type: String,
            required: true,
            trim: true
        },

        dispatched_by: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: [
                "dispatched",
                "accepted",
                "en_route",
                "arrived",
                "completed",
                "cancelled"
            ],
            default: "dispatched"
        },

        dispatched_at: {
            type: Date,
            default: Date.now
        },

        accepted_at: {
            type: Date
        },

        en_route_at: {
            type: Date
        },

        arrived_at: {
            type: Date
        },

        completed_at: {
            type: Date
        },
        cancelled_at: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

// Query optimization
dispatchSchema.index({ emergency_id: 1 });
dispatchSchema.index({ unit_id: 1 });
dispatchSchema.index({ status: 1 });

module.exports = mongoose.model("Dispatch", dispatchSchema);