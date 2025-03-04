const mongoose = require("mongoose");
const BusRoutesSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true,
        },
        routeId: {
            type: Number,
            required: true,
        },
        userId:{
            type: Number,
            required: false,
        },
        name: {
            type: String,
            required: true,
        },
        start: {
            type: String,
            required: true,
        },
        end: {
            type: String,
            required: true,
        },
        driverId: {
            type: Number,
            required: true,
        },
        careTakerId: {
            type: Number,
            rrequired: true,
        },
        vehicleId: {
            type: String,
            required: true,
        },
        number: {
            type: Number,
            required: true,
        },
        feesFreq: {
            type: String,
            required: true,
        },
        currentLocation: {
            lattitude: {
                type: Number,
                required: false,
            },
            longitude: {
                type: Number,
                required: false,
            },
        },
        stopDetails: {
            type: Array,
            required: true,
        },
    },
    { strict: false, timestamps: true }
);
const BusRoutesModel = mongoose.model("busroutes", BusRoutesSchema);
module.exports = BusRoutesModel;
