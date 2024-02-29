const mongoose = require('mongoose');
const bookIssueLogSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false
        },
        labmembershipNumber: {
            type: Number,
            require: false
        },
        studentId: {
            type: Number,
            required: false
        },
        issueDate: {
            type: Date,
            default: Date.now(),
            require: true
        },
        dueDate: {
            type: Date
        },
        returnDate: {
            type: Date,
        },
        returned: {
            type: Boolean,
            default: false,
        },
        bookIssueLogId: {
            type: Number
        },
        addmissionId:{
            type:Number,
            required:false
        }
    },
    { strict: false, timestamps: true }
);
bookIssueLogSchema.plugin(require("mongoose-autopopulate"));
const bookIssueLogModel = mongoose.model("bookIssueLog", bookIssueLogSchema);
module.exports = bookIssueLogModel;
