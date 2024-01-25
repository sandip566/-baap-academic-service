const mongoose = require('mongoose');
const attendanceSchema = new mongoose.Schema(
    {
        attendanceId: Number,
        groupId: {
            type: Number,
            required: false
        },
        studentName:{
            type:Number,
            required: false
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
