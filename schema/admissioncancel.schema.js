const mongoose = require("mongoose");

const AdmissionCancelSchema = new mongoose.Schema(
    {
        groupId: {
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

const AdmissionCancelModel = mongoose.model("admissioncancel", AdmissionCancelSchema);
module.exports = AdmissionCancelModel;
