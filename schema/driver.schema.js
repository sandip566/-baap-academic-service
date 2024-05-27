const mongoose = require("mongoose");

const DriverSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true
        },
        empId: {
            type: Number,
            required: true
        },
        driverId: {
            type: Number,
            required: false
        },
        dateOfBirth: {
            type: String,
            required: false
        },
        experience: {
            type: String,
            required: true
        },
        fitnessCertificate: {
            type: String,
            required: false
        },
        licenceImg: {
            type: String,
            required: false
        },
        startDate: {
            type: String,
            required: true
        },
        endDate: {
            type: String,
            required: true
        }
    },
    { timestamps: true, strict: false }
);

const DriverModel = mongoose.model("driver", DriverSchema);
module.exports = DriverModel;
