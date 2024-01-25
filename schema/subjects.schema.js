const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required : false
        },
        subjectId: {
            type: Number,
            required: false,
        },
        name: {
            type: String,
            required: false,
        },
        courseId: {
            type: Number,
            required: false,
        },
        classId: {
            type: Number,
            required: false,
        },
        totalMarks: {
            type: Number,
            required: false,
        },
        passingMarks: {
            type: Number,
            required: false,
        },
        theory: {
            type: Number,
            required: false,
        },
        practical: {
            type: Number,
            required: false,
        },
        tutor: {
            type: String,
            required: false,
        },
    },
    { strict: false, timestamps: true }
);
SubjectSchema.plugin(require("mongoose-autopopulate"));
const SubjectModel = mongoose.model("subject", SubjectSchema);
module.exports = SubjectModel;
