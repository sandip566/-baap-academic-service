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
        }
    },
    { timestamps: true }
);

const HostelFeesInstallmentModel = mongoose.model("hostelfeesinstallment", HostelFeesInstallmentSchema);
module.exports = HostelFeesInstallmentModel;
