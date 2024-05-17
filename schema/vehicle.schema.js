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
        vehicleName: {
            type: String,
            required: true
        },
        vehicleNumber: {
            type: Number,
            required: true
        },
        vehicleType: {
            type: String,
            required: true
        },
        vehicleModel:{
            type: String,
            required: false
        },
        vehicleCondition:{
            type: String,
            required: false
        },
        seatCapacity:{
            type: Number,
        },
        vehicleAddress:[{
            village:{
                type: String, 
            },
            city:{
                type: String, 
            },
            state:{
                type: String, 
            },
            country:{
                type: String,  
            }
        }]
    },
    { strict: false, timestamps: true }
);
const vehicleModel = mongoose.model("vehicle", vehicle);
module.exports = vehicleModel;
