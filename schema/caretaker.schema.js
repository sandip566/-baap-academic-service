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
            required: false
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
            required: false
        },
        endDate: {
            type: String,
            required: false
        }
    },
    { timestamps: true, strict: false }
);

const CareTakerModel = mongoose.model("caretaker", CareTakerSchema);
module.exports = CareTakerModel;
