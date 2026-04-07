const mongoose = require("mongoose");

const DreamSchema = new mongoose.Schema({
  childName: {
    type: String,
    required: true
  },

  age: {
    type: Number,
    required: true
  },

  gender: {
    type: String,
    required: true
  },

  city: {
    type: String,
    required: true
  },

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  document: {
    type: String // base64 file
  },

  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  status: {
  type: String,
  enum: [
    "pending",
    "approved",
    "denied",
    "chosen",
    "confirmed",
    "fulfilled",
    "completed", 
    "request_denied"
  ],
  default: "pending"
},

  // ADMIN COMMENT (for denied dreams or denied requests)
  adminComment: {
    type: String,
    default: ""
  },

  mecenasId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  aiSuggestion: {
  type: String,
  default: ""
},

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Dream", DreamSchema);