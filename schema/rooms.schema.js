const mongoose = require("mongoose");

const room = new mongoose.Schema(
  {
    groupId: {
      type: Number,
      require: false
    },
    roomId: {
      type: Number,
      require: false
    },
    name: {
      type: String
    },
   
    capacity: {
      type: Number,
    },
    hostelId: {
      type: Number,
      require: false
    }
  },
  { strict: false, timestamps: true }
);
room.plugin(require("mongoose-autopopulate"));
const roomModel = mongoose.model("rooms", room);
module.exports = roomModel;
