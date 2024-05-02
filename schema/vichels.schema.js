const mongoose = require("mongoose");
const vichels = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false
        },
        vichelsId: {
            type: Number
        },
        vichelsName: {
            type: String
        },
        vichelsAddress: {
            type: String
        },
        vichelsPhoneNo: {
            type: Number
        },
        vichelsEmail: {
            type: String
        },
        taxId: {
            type: Number
        }
    },
    { strict: false, timestamps: true }
);
const vichelsModel = mongoose.model("vichels", vichels);
module.exports = vichelsModel;
