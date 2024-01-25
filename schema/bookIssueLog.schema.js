const mongoose = require('mongoose');

const bookIssueLogSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1
        },
        labmembershipNumber: {
            type: Number,
            require: false
        },
        studentId: {
            type:Number,
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: false,
            ref: 'student'
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
    },
    { strict: false, timestamps: true }
);
bookIssueLogSchema.plugin(require("mongoose-autopopulate"));
const bookIssueLogModel = mongoose.model("bookIssueLog", bookIssueLogSchema);
module.exports = bookIssueLogModel;
