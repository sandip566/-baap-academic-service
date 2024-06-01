const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({

    communicationId: Number,

    sender:String,

    receiver: String,

    userId: Number,

    handledBy: String,

    message: String,

    groupId: {
        type: Number,
        required: false,
    },

  });

module.exports = mongoose.model("communication", chatSchema);
