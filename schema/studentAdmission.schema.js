const mongoose = require("mongoose");

const studentsAdmissionSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1,
        },
        studentAdmissionId: {
            type: Number,
        },
        addmissionId:{
            type: Number,
            required: false,
        },
        academicYear: {
            type:Number,
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: true,
            ref: "academicyear",
        },
        studentId: {
            type:Number,
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: true,
            ref: "student",
        },
        course: {
            type:Number,
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: false,
            ref: "course",
        },
        division: {
            type:Number,
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: false,
            ref: "division",
        },
        feesTemplate: {
            type:Number,
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: false,
            ref: "feesTemplate",
        },
    },
    { strict: false, timestamps: true }
);
studentsAdmissionSchema.plugin(require("mongoose-autopopulate"));
const StudentsAdmissionModel = mongoose.model(
    "studentsAdmission",
    studentsAdmissionSchema
);
module.exports = StudentsAdmissionModel;
