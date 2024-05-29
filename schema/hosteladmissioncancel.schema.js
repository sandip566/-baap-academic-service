const mongoose = require("mongoose");

const HostelAdmissionCancelSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true,
        },
        hostelAdmissionCancelId: {
            type: Number,
            required: true,
        },
        hostelAdmissionId:{
            type: Number,
            required: true,
        },
        userId:{
            type: Number,
            required: true,  
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

const HostelAdmissionCancelModel = mongoose.model("hosteladmissioncancel", HostelAdmissionCancelSchema);
module.exports = HostelAdmissionCancelModel;
