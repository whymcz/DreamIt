const mongoose = require("mongoose");

const JoyPostSchema = new mongoose.Schema({

  mecenasId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  mecenasName: String,

  media: String,

  text: String,

  avatar: String,

  status: {
    type: String,
    default: "pending"
  },

  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  comments: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      userName: String,
      text: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("JoyPost", JoyPostSchema);