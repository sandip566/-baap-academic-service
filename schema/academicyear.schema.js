const mongoose = require("mongoose");
const AcademicYearSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1
        },
        academicYearId: {
            type: Number,
            required: false
        },
        year: {
            type: String,
            required: false,
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
