
const mongoose = require("mongoose");
const feesInstallmentSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1,
        },
        studentId: {
            type:Number,
            type: mongoose.Schema.Types.ObjectId,
            ref: "student",
            autopopulate: false,
        },
        installmentId: {
            type: Number,
        },
        courseId: {
            type:Number,
            type: mongoose.Schema.Types.ObjectId,
            ref: "course",
            autopopulate: false,
        },
        dueDate: {
            type: Date,
        },
        installmentAmount: {
            type: Number,
        },
        isPaid: {
            type: Boolean,
            default: false
        },
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
