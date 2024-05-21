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
        shiftId:{
            type: Number,
            required: true
        },  
        empId: {
            type: Number,
            required: true
        },
        vehicleNo: {
            type: Number,
            required: false
        },
        Diesel: {
            type: Number,
            required: false
        },
        fuelType: {
            type: String,
            enum: ['Petrol', 'Diesel', 'CNG'],
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
        vehicleModel:{
            type: String,
            required: false
        },
        wheel:{
            type: String,
            required: false
        },
        vehicleCondition:{
            type: String,
            enum: ['fair', 'good', 'excellent'],
            required: false
        },
        rcNo:{
            type: String,
            required: false
        },
        vehicleSeatNo:{
            type: Number,
            required: false
        }
    },
    { strict: false, timestamps: true }
);
const vehicleModel = mongoose.model("vehicle", vehicle);
module.exports = vehicleModel;
