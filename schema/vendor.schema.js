const mongoose = require("mongoose");
const vendor = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false
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
