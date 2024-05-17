const mongoose = require("mongoose");

const TransportCoordinatorSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true
        },
        routeId: {
            type: Number,
            required: true,
        },
        transportCoordinatorId: {
            type: Number,
            required: true
        },
        vehicleName: {
            type: String,
            required: true
        },
        driverId: {
            type: Number,
            required: true
        },
        caretakerId: {
            type: Number,
            required: true
        },
        startTime:{
            type: String,
            required: true
        },
        status:{
            type: String,
            enum:['Start','Stop'],
            required: true
        },
        seatCount:{
            type: Number,
            required: true
        },
        vehicleNumber: {
            type: Number,
            required: true
        },
        location: {
            type: {
                type: String,
                default: 'Point'
            },
            coordinates: [Number]
        }
    },
    { timestamps: true, strict: false }
);

const TransportCoordinatorModel = mongoose.model("transportcoordinator", TransportCoordinatorSchema);
module.exports = TransportCoordinatorModel;
