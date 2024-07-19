const mongoose = require("mongoose");
const SubjectSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false,
        },
        subjectId: {
            type: Number
        },
        courseId: {
            type: Number,
            required: false,
        },
        Department: {
            type: Number,
            required: false,
        },
        classId: {
            type: Number,
            required: false,
        },
        semesterId: {
            type: Number,
            required: false,
        },
        name: {
            type: String,
        },
        description: {
            type: String,
        },
        credits: {
            type: Number,
        },
    },
    { strict: false, timestamps: true }
);
const SubjectModel = mongoose.model("subject", SubjectSchema);
module.exports = SubjectModel;
