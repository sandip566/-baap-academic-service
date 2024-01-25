const mongoose = require('mongoose');
const attendanceSchema = new mongoose.Schema(
    {
        attendanceId: Number,
        groupId: {
            type: Number,
            default: 1
        },
        studentName:{
            type:Number,
            type:mongoose.Schema.Types.ObjectId,
            autopopulate:false,
            ref:'student'
        },
        startDate: {
            type:Date,
          
        },
        endDate: {
            type:Date,
     
        },
        timeIn: {
            type: Number,
      
        },
        timeOut: {
            type: Number,
           
        },
        present: {
            type:Boolean,
         
        },
    
        absent: {
            type:Boolean,
         
        },
        dateOfleave: {
            type:Date,
          
        },
        reasonOfAbsent:{
            type:String,
         
        },
        lateArrival:{
            type:Boolean,
          
        },
        reasonOfLateArrival:{
            type:String,
     
        },
        isPreInformedOfAbsent:{
            type:Boolean,
            
        },
        
        Remark: {
            type:String,
           
        },
    },
    { strict: false, timestamps: true }
);
attendanceSchema.plugin(require("mongoose-autopopulate"));
const attendanceModel = mongoose.model("attendance", attendanceSchema);
module.exports = attendanceModel;
