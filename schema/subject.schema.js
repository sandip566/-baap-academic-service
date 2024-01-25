const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1
        },
        subjectId: {
            
            type: Number,
            required: false,
            unique: false
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

