const mongoose = require("mongoose");

const DriverSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true
        },
        driverName: {
            type: String,
            required: true,
        },
        driverId: {
            type: Number,
            required: false
        },
        PhoneNumber: {
            type: Number,
            required: true
        },
        licenceNumber: {
            type: Number,
            required: true
        },
        driverAge: {
            type: Number,
            required: true
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
            required: true,
        },
        driverNumber: {
            type: Number,
            required: true
        },
        experience: {
            type: String,
            required: true
        },
        fromDate: {
            type: String,
            required: true
        },
        toDate: {
            type: String,
            required: true
        },
        driverAddress: [{
            village: {
                type: String,
            },
            city: {
                type: String
            },
            state: {
                type: String,
            }
        }],
        country: {
            type: String,
            required: true
        },
        KYC: [{
            pancardNumber: {
                type: String
            },
            aadharNumber: {
                type: Number
            },
            medicalCertificate: {
                type: Boolean,
                required: true
            }
        }]
    },
    { timestamps: true, strict: false }
);

const DriverModel = mongoose.model("driver", DriverSchema);
module.exports = DriverModel;
