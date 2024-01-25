const mongoose = require("mongoose");
const feesPaymentSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1,
        },
        feesPaymentId: {
            type: Number,
        },
        paidAmount: {
            type: Number,
        },
        installmentId: {
            type:Number,
            type: mongoose.Schema.Types.ObjectId,
            ref: "feesInstallment",
            autopopulate: false,
        },
        paymentDate: {
            type: Date,
        },
        mode: {
            type: String,
            enum: ["ONLINE", "CASH", "creditCard", "bank transfer"],
        },
        receivedBy: {
            memberId: {
                type:Number,
                type: mongoose.Schema.Types.ObjectId,
                ref: "member",
                autopopulate: false,
            },
        },
        feesTemplateId: {
            type:Number,
            type: mongoose.Schema.Types.ObjectId,
            ref: "feesTemplate",
            autopopulate: false,
        },
        academicYearsId: {
            type:Number,
            type: mongoose.Schema.Types.ObjectId,
            ref: "academicyear",
            autopopulate: false,
        },
        studentId: {
            type:Number,
            type: mongoose.Schema.Types.ObjectId,
            ref: "student",
            autopopulate: false,
        },
    },
    { strict: false, timestamps: true }
);
feesPaymentSchema.plugin(require("mongoose-autopopulate"));
const FeesModel = mongoose.model("feesPayment", feesPaymentSchema);
module.exports = FeesModel;
