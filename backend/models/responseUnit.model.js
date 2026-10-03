const mongoose = require("mongoose");

const responseUnitSchema = new mongoose.Schema(
  {
    unit_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    unit_type: {
      type: String,
      required: true,
      enum: [
        "police_car",
        "ambulance",
        "fire_truck",
        "rescue_team"
      ]
    },

    department: {
      type: String,
      required: true,
      enum: [
        "police",
        "medical",
        "fire"
      ]
    },

    unit_name: {
      type: String,
      required: true,
      trim: true
    },

    current_location: {
      latitude: {
        type: Number,
        required: true
      },
      longitude: {
        type: Number,
        required: true
      }
    },

    status: {
      type: String,
      enum: [
        "available",
        "dispatched",
        "busy",
        "offline"
      ],
      default: "available"
    },

    assigned_emergency: {
      type: String,
      default: null
    },

    cooldown_until: {
      type: Date,
      default: null
    },

    last_updated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Query optimization
responseUnitSchema.index({ status: 1 });
responseUnitSchema.index({ department: 1 });
responseUnitSchema.index({ department: 1, status: 1 });

module.exports = mongoose.model(
  "ResponseUnit",
  responseUnitSchema
);