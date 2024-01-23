const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1
        },
        subjectId: {
            type: Number,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: true,
            ref: 'course'
        },
        class: {
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: true,
            ref: 'class'
        },
        totalMarks: {
            type: Number,
            required: true
        },
        passingMarks: {
            type: Number,
            required: true
        },
        theory: {
            type: Number,
            required: true
        },
        practical: {
            type: Number,
            required: true
        },
        tutor: {
            type: String,
            required: true
        }
    },
    { strict: false, timestamps: true }
);
SubjectSchema.plugin(require('mongoose-autopopulate'));
const SubjectModel = mongoose.model("subject", SubjectSchema);
module.exports = SubjectModel;
