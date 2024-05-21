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
            required: true,
        },
        stopId:{
            type: Number,
            required: true
        },
        fatherName: {
            type: String,
            required: false
        },
        motherName: {
            type: String,
            required: false
        },
        age: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['Active', 'In-active'],
            required: true
        },
        adharCardNo: {
            type: Number,
            required: true
        },
        panCardNo: {
            type: String,
            required: true
        },
        medicalCertificateImg: {
            type: String,
            required: true
        },
        stopId:{
            type: Number,
            required: true
        },
        totalFees:{
            type: Number,
            required: true
        },
        startDate:{
            type: String,
            required: true
        },
        endDate:{
            type: String,
            required: true
        }

    },
    { timestamps: true }
);

const TravellerModel = mongoose.model("traveller", TravellerSchema);
module.exports = TravellerModel;
