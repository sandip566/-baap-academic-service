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
        academicYear: {
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: true,
            ref: "academicyear",
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: true,
            ref: "student",
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: true,
            ref: "course",
        },
        division: {
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: true,
            ref: "division",
        },
        feesTemplate: {
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: true,
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
