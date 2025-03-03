const mongoose = require("mongoose");

const feesInstallmentSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false,
        },
        addmissionId: {
            type: Number,
            required: false,
        },
        studentId: {
            type: Number,
            required: false,
        },
        installmentId: {
            type: Number,
        },

        isPaid: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            default: "pending",
        },
        installmentNo: {
            type: Number,
            require: false,
        },
        reciptNo: {
            type: Number,
        },
    },
    { strict: false, timestamps: true }
);
feesInstallmentSchema.plugin(require("mongoose-autopopulate"));
const FeesInstallmentModel = mongoose.model(
    "feesInstallment",
    feesInstallmentSchema
);
module.exports = FeesInstallmentModel;
