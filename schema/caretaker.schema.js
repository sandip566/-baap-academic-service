const mongoose = require("mongoose");

const CareTakerSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true
        },
        careTakerName: {
            type: String,
            required: true,
        },
        careTakerId: {
            type: Number,
            required: false
        },
        PhoneNumber: {
            type: Number,
            required: true
        },
        age: {
            type: Number,
            required: true
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
            required: true,
        },
        careTakerNumber: {
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
        careTakerAddress: [{
            village: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            }
        }],
        country: {
            type: String,
            required: true
        },
        KYC: [{
            pancardNumber: {
                type: Number
            },
            aadharNumber:{
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

const CareTakerModel = mongoose.model("caretaker", CareTakerSchema);
module.exports = CareTakerModel;
