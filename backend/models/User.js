const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["parent", "mecenas", "admin"],
      required: true
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    verificationToken: {
      type: String,
      default: null
    },

    resetPasswordToken: {
      type: String,
      default: null
    },

    resetPasswordExpires: {
      type: Date,
      default: null
    },

    // ===== PROFILE FIELDS =====
    phone: {
      type: String,
      default: ""
    },

    avatar: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true // 👈 automatically adds createdAt & updatedAt
  }
);

module.exports = mongoose.model("User", UserSchema);