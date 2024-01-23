const mongoose = require('mongoose');
const attendanceSchema = new mongoose.Schema(
    {
        attendanceId: Number,
        groupId: {
            type: Number,
            default: 1
        },
        studentName:{
            type:mongoose.Schema.Types.ObjectId,
            autopopulate:true,
            ref:'student'
        },
        startDate: {
            type:Date,
            required: true,
        },
        endDate: {
            type:Date,
            required: true,
        },
        timeIn: {
            type: Number,
            require: true
        },
        timeOut: {
            type: Number,
            require: true
        },
        present: {
            type:Boolean,
            require:true
        },
    
        absent: {
            type:Boolean,
            require: true
        },
        dateOfleave: {
            type:Date,
            required: true
        },
        Remark: {
            type:String,
            require:true
        },
    },
    { strict: false, timestamps: true }
);
attendanceSchema.plugin(require("mongoose-autopopulate"));
const attendanceModel = mongoose.model("attendance", attendanceSchema);
module.exports = attendanceModel;
