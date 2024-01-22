const mongoose = require("mongoose");

const AcademicYearSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1
        },
        academicYearId: {
            type: Number,
            required: true
        },
        year: {
            type: String,
            required: true,
        },
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        }
    },
    { strict: false, timestamps: true }
);
const AcademicYearModel = mongoose.model("academicyear", AcademicYearSchema);
module.exports = AcademicYearModel;
