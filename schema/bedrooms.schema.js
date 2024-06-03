const mongoose = require("mongoose");

const BedRoomsSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
            required: false,
        },
        roomId:{
            type: Number,
        },
        bedRoomId: {
            type: Number,
            required: true,
        },
        hostelId: {
            type: Number,
            required: true,
        },
        beds: [
            {
                bedId: {
                    type: Number,
                    required: true,
                },
                status: {
                    type: String,
                    required: true,
                    // enum: ["available", "reserved", "confirmed", "cancelled"],
                    default: "available",
                },
            },
        ],
    },
    {strict:false, timestamps: true }
);

const BedRoomsModel = mongoose.model("bedrooms", BedRoomsSchema);
module.exports = BedRoomsModel;
