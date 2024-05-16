const mongoose = require("mongoose");
const vehicle = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false
        },
        vehicleId: {
            type: Number
        },
        vehicleName: {
            type: String
        },
        vehicleAddress: {
            type: String
        },
        vehiclePhoneNo: {
            type: Number
        },
        vehicleEmail: {
            type: String
        },
        taxId: {
            type: Number
        }
    },
    { strict: false, timestamps: true }
);
const vehicleModel = mongoose.model("vehicle", vehicle);
module.exports = vehicleModel;
