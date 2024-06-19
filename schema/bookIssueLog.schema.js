const mongoose = require("mongoose");
const bookIssueLogSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true,
        },
        userId:{
            type:Number,
            required: true,
        },
        issuedDate:{
            type:Date
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
        
        status:{
            type:String,
            enum:["Reserved","Returned","Issued","Overdue"],
            require:true
        },
        isReturn:{
            type:Boolean
        },
        isReserve:{
            type:Boolean,
            required:true
        },
        isOverdue:{
            type:Boolean,
            default:false
        }
    },
    { strict: false, timestamps: true }
);
bookIssueLogSchema.plugin(require("mongoose-autopopulate"));
const bookIssueLogModel = mongoose.model("bookIssueLog", bookIssueLogSchema);
module.exports = bookIssueLogModel;
