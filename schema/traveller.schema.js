const mongoose = require("mongoose");

const TravellerSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true
        },
        travellerId: {
            type: Number,
            required: true
        },
        empId: {
            type: Number,
            required: true
        },
        routeId: {
            type: Number,
            required: false,
        },
        stopId: {
            type: Number,
            required: false
        },
        emergrncyContact: [{
            emergrncyContact1: {
                type: Number,
                required: true
            },
            emergrncyContact2: {
                type: Number,
                required: true
            }
        }],
        dateOfBirth: {
            type: String,
            required: false
        },
        status: {
            type: String,
            enum: ['Active', 'In-active'],
            required: false
        },
        fitnessCertificate: {
            type: String,
            required: false
        },
        totalFees: {
            type: Number,
            required: false
        },
        startDate: {
            type: String,
            required: false
        },
        endDate: {
            type: String,
            required: false
        }

    },
    { strict: false, timestamps: false }
);

const TravellerModel = mongoose.model("traveller", TravellerSchema);
module.exports = TravellerModel;
