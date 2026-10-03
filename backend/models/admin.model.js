const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  department: {
    type: String,
    required: true,
    enum: [
      "police",
      "medical",
      "fire",
      "superadmin"
    ]
  },

  phone: {
    type: String
  },

  email: {
    type: String,
    lowercase: true,
    trim: true
  },

  is_active: {
    type: Boolean,
    default: true
  },

  created_at: {
    type: Date,
    default: Date.now
  }
});

adminSchema.index({
  department: 1
});

module.exports = mongoose.model(
  "Admin",
  adminSchema
);