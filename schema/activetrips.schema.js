const mongoose = require("mongoose");

const ActiveTripsSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true
        },
        userId:{
            type: Number,
        },
        tripId: {
            type: Number,
            required: true
        },
        routeId: {
            type: Number,
            required: true
        },
        vehicleId: {
            type: Number,
            required: true
        },
        driverId: {
            type: Number,
            required: true
        },
        careTakerId: {
            type: Number,
            required: true
        },
        currentLocation: {
            type: Array,
            required: false
        },
        startDate: {
            type: String,
            required: false
        },
        endtDate: {
            type: String,
            required: false
        }
    },
    { timestamps: true, strict: false }
);

const ActiveTripsModel = mongoose.model("activetrips", ActiveTripsSchema);
module.exports = ActiveTripsModel;
