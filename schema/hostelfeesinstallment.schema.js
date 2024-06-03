const mongoose = require("mongoose");

const HostelFeesInstallmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        groupId: {
            type: Number,
            required: true,
        },
        hostelInstallmentId:{
            type: Number,
            required: true,
        },
        hostelAdmissionId:{
            type: Number,
            required: false,
        },
        status: {
            type: String,
            default: "pending",
        },
    },
    {strict:false, timestamps: true }
);

const HostelFeesInstallmentModel = mongoose.model("hostelfeesinstallment", HostelFeesInstallmentSchema);
module.exports = HostelFeesInstallmentModel;
