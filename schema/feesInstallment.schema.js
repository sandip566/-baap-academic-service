const mongoose = require("mongoose");
const feesInstallmentSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false,
        },
        addmissionId: {
            type: Number,
            required: false
        },
        // userId: {
        //     type:Number,
        //     required: false
        // },
        installmentId: {
            type: Number,
        },
        // courseId: {
        //     type:Number,
        //     required: false
        // },
        // dueDate: {
        //     type: Date,
        // },
        // installmentAmount: {
        //     type: Number,
        // },
        // isPaid: {
        //     type: Boolean,
        //     default: false
        // },
        installmentNo: {
            type: Number,
            require: false
        },
        reciptNo: {
            type: Number,
        },
    },
    { strict: false, timestamps: true }
);
feesInstallmentSchema.plugin(require("mongoose-autopopulate"));
const FeesInstallmentModel = mongoose.model("feesInstallment", feesInstallmentSchema);
module.exports = FeesInstallmentModel;
