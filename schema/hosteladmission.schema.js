const mongoose = require("mongoose");

const HostelAdmissionSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
            required: false,
        },
        hostelAdmissionId:{
            type: Number,
            required: true,
        
        },
        status:{
            type: String,
            required: false,
        },
        hostelInstallmentId:{
            type: Number,
            required: false,
        
        }
    },
    {strict:false, timestamps: true }
);

const HostelAdmissionModel = mongoose.model("hosteladmission", HostelAdmissionSchema);
module.exports = HostelAdmissionModel;
