const mongoose = require("mongoose");

const vendor = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1,
            required: true
        },
        vendorId: {
            type: Number
        },
        vendorName: {
            type: String
        },
        vendorAddress: {
            type: String
        },
        vendorPhoneNo: {
            type: Number
        },
        vendorEmail: {
            type: String
        },
        taxId: {
            type: Number
        }
    },
    { strict: false, timestamps: true }
);
const vendorModel = mongoose.model("vendor", vendor);
module.exports = vendorModel;
