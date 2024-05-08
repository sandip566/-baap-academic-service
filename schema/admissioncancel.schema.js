const mongoose = require("mongoose");

const AdmissionCancelSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true,
        },
        addmissionId:{
            type: Number,
            required: true,
        },
        userId:{
            type: Number,
            required: true,  
        },
        admissionCancelId:{
            type: Number,
            required: false, 
        },
        status:{
            type:String,
            required:false,
            default:"pending"
        },
        name:{
            type:String,
            required:false,
        }
    },
    {strict:false, timestamps: true }
);

const AdmissionCancelModel = mongoose.model("admissioncancel", AdmissionCancelSchema);
module.exports = AdmissionCancelModel;
