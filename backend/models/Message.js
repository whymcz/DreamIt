const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({

  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  dreamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dream",
    required: true
  },

  text: {
    type: String,
    required: true
  },

  isRead: {
    type: Boolean,
    default: false
  },

  file: {
  type: String,
  default: ""
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

  

});

module.exports = mongoose.model("Message", MessageSchema);