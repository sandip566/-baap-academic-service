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
        stopId:{
            type: Number,
            required: false
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
            required: false
        },
        status: {
            type: String,
            enum: ['Active', 'In-active'],
            required: false
        },
        adharCardNo: {
            type: Number,
            required: false
        },
        panCardNo: {
            type: String,
            required: false
        },
        medicalCertificateImg: {
            type: String,
            required: false
        },
        totalFees:{
            type: Number,
            required: false
        },
        startDate:{
            type: String,
            required: false
        },
        endDate:{
            type: String,
            required: false
        }

    },
    {strict:false, timestamps: false }
);

const TravellerModel = mongoose.model("traveller", TravellerSchema);
module.exports = TravellerModel;
