const mongoose = require("mongoose");
const bookIssueLogSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true,
        },
        labmembershipNumber: {
            type: Number,
            require: false,
        },
        addmissionId: {
            type: Number,
            required: false,
        },
        dueDate: {
            type: Date,
        },
        returnDate: {
            type: Date,
        },
        bookIssueLogId: {
            type: Number,
        },
        addmissionId: {
            type: Number,
            required: false,
        },
        userId: {
            type: Number
        },
        status:{
            type:String,
            enum:["Reserved","Returned","Issued","Overdue"]
        }
    },
    { strict: false, timestamps: true }
);
bookIssueLogSchema.plugin(require("mongoose-autopopulate"));
const bookIssueLogModel = mongoose.model("bookIssueLog", bookIssueLogSchema);
module.exports = bookIssueLogModel;
