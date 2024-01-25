const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1
        },
        subjectId: {
            type:Number,
            type: Number,
            required: false,
            unique: false
        },
        name: {
            type: String,
            required: false
        },
        course: {
            type:Number,
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: false,
            ref: 'course'
        },
        class: {
            type:Number,
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: false,
            ref: 'class'
        },
        totalMarks: {
            type: Number,
            required: false
        },
        passingMarks: {
            type: Number,
            required: false
        },
        theory: {
            type: Number,
            required: false
        },
        practical: {
            type: Number,
            required: false
        },
        tutor: {
            type: String,
            required: false
        }
    },
    { strict: false, timestamps: true }
);
SubjectSchema.plugin(require('mongoose-autopopulate'));
const SubjectModel = mongoose.model("subject", SubjectSchema);
module.exports = SubjectModel;
