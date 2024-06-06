const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
   
    communicationId: {
      type: Number,
      required: false,
  },
    sender: {
      type: String,
      required: false,
  },
    receiver: {
      type: String,
      required: false,
  },
    userId: {
      type: Number,
      required: true,
  },
    handledBy: {
      type: String,
      required: false,
  },
    message: {
      type: String,
      required: false,
  },

    groupId: {
        type: Number,
        required: false,
    },

  });

module.exports = mongoose.model("communication", chatSchema);
