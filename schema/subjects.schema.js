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
        Name: {
            type: String,
            required: true
        },
        Course: {
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: true,
            ref:'course'
        },
        Class: {
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: true,
            ref:'class'
        },
        TotalMarks:{
            type:Number,
            required:true
        },
        PassingMarks:{
            type:Number,
            required:true
        },
        Theory:{
            type:Number,
            required:true
        },
        Practical:{
            type:Number,
            required:true
        },
        Tutor:{
            type:String,
            required:true
        }
    },
    { strict: false, timestamps: true }
);
SubjectSchema.plugin(require('mongoose-autopopulate'))
const SubjectModel = mongoose.model("subject", SubjectSchema);
module.exports = SubjectModel;
