const mongoose = require("mongoose");
const AcademicYearSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false
        },
        academicYearId: {
            type: Number,
            required: false
        },
        year: {
            type: String,
            required: false,
        }
    },
    { strict: false, timestamps: true }
);
const AcademicYearModel = mongoose.model("academicyear", AcademicYearSchema);
module.exports = AcademicYearModel;
