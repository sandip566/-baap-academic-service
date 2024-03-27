const mongoose = require("mongoose");

const SemesterSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        classId: {
            type: Number,
            required: false,
        },
        courseId: {
            type: Number,
            required: false,
        },
        academicYear: {
            type: Number,
            required: false,
        },
    },
    { strict: false, timestamps: true }
);

const SemesterModel = mongoose.model("semester", SemesterSchema);
module.exports = SemesterModel;
