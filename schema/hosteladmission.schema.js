const mongoose = require("mongoose");

const HostelAdmissionSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        hostelAdmissionId:{
            type: Number,
            required: true,
        
        }
    },
    {strict:false, timestamps: true }
);

const HostelAdmissionModel = mongoose.model("hosteladmission", HostelAdmissionSchema);
module.exports = HostelAdmissionModel;
