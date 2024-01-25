const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1
        },
        courseId: {
            type: Number,
            required: false,
        },
        classId: {
            type: Number,
            required: false,
        },
        subjectName: {
            type: String,
        },
        Description: {
            type: String
        },
        credits: {
            type: Number,
        },
    },
    { strict: false, timestamps: true }
);
const SubjectModel = mongoose.model("subject", SubjectSchema);
module.exports = SubjectModel;

