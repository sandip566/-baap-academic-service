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
            required: false
        },
        studentId: {
            type:Number,
            required: false
        },
        courseId: {
            type:Number,
            required: false
        },
        divisionId: {
            type:Number,
            required: false
        },
        feesTemplate: {
            type:Number,
           required: false
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
