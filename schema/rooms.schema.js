const mongoose = require("mongoose");

const room = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false,
        },
        roomId: {
            type: Number,
            required: false,
        },
        hostelId: {
            type: Number,
            required: true,
        },
        floorNo: {
            type: Number,
            required: true,
        },
        numberOfRooms: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
        },
        capacity: {
            type: Number,
            required: true,
        },
        status:{
          type: String,
          required: false,
          default: "available"
        }
    },
    { strict: false, timestamps: true }
);
room.plugin(require("mongoose-autopopulate"));
const roomModel = mongoose.model("rooms", room);
module.exports = roomModel;
