const mongoose = require("mongoose");

const CareTakerSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true
        },
        empId:{
            type: Number,
            required: true
        },
        careTakerId: {
            type: Number,
            required: false
        },
        experience: {
            type: String,
            required: true
        },
        medicalCertificateImg:{
            type:String,
            required:false
        },
        adharCardNo:{
            type:Number,
            required:false
        },
        panCardNo:{
            type:String,
            required:false 
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

const CareTakerModel = mongoose.model("caretaker", CareTakerSchema);
module.exports = CareTakerModel;
