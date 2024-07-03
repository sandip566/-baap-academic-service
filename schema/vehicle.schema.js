const mongoose = require("mongoose");
const vehicle = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true
        },
        vehicleId: {
            type: Number,
            required: true
        },
        ownerName: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: Number,
            required: true
        },
        shiftId: {
            type: Number,
            required: false
        },
        vehicalNo: {
            type: String,
            required: false
        },
        Diesel: {
            type: Number,
            required: false
        },
        fuelType: {
            type: String,
            enum: ['Petrol', 'Diesel', 'CNG', 'Electric'],
            required: false
        },
        color: {
            type: String,
            required: false
        },
        vehicleType: {
            type: String,
            enum: ['Mini Bus', '4 seater', '7 seater'],
            required: false
        },
        Model: {
            type: String,
            required: false
        },
        wheel: {
            type: String,
            required: false
        },
        vehicleCondition: {
            type: String,
            enum: ['fair', 'good', 'excellent'],
            required: false
        },
        rcNo: {
            type: String,
            required: false
        },
        SeatNo: {
            type: Number,
            required: false
        }
    },
    { strict: false, timestamps: true }
);
const vehicleModel = mongoose.model("vehicle", vehicle);
module.exports = vehicleModel;
