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
        subjectName: {
            type: String,
            //required: true
        },
        Description: {
            type: String
        },
        credits: {
            type: Number,
            //required: true
        },
    },
    { strict: false, timestamps: true }
);
const SubjectModel = mongoose.model("subject", SubjectSchema);
module.exports = SubjectModel;

