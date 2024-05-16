const mongoose = require("mongoose");

const CareTakerSchema = new mongoose.Schema(
    {
        name: {
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
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
            require: true
        },
        age: {
            type: Number,
            require: true
        },
        experience: {
            type: Number,
            require: true
        },
        address: [{
            addressLine: {
                type: String,
                required: false
            },
            taluka: {
                type: String,
                required: false,
            },
            district: {
                type: String,
                required: false,
            },
            state: {
                type: String,
                required: false,
            },
            country: {
                type: String,
                required: false,
            },
        }],
        busId: {
            type: Number,
        },
        groupId: {
            type: Number,
            required: false,
        },
        careTakerJoingDate: {
            type: String,
            required: true
        }
    },
    { timestamps: true, strict: false }
);

const CareTakerModel = mongoose.model("caretaker", CareTakerSchema);
module.exports = CareTakerModel;
