const mongoose = require('mongoose');

const miscellaneousPaymentSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1
        },
        miscellaneousPaymentId: {
            type: Number,
            require: true
        },
        amount: {
            type: Number,
        },
        installmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "feesInstallment",
            autopopulate: true
        },
        paymentDate: {
            type: Date,
            default: Date.now()
        },
        paymentMode: {
            type: String,
            enum: ['online', 'cash', 'creditCard', 'bank transfer'],
        },
        transactionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "transaction",
            autopopulate: true
        },
        receivedBy: {
            memberId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "member",
                autopopulate: true
            }
        },
        feesTemplateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "feesTemplate",
            autopopulate: true
        },
        academicYearsId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "academicyear",
            autopopulate: true
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            autopopulate: true
        },
    },
    { strict: false, timestamps: true }
);
miscellaneousPaymentSchema.plugin(require("mongoose-autopopulate"))
const miscellaneousPaymentModel = mongoose.model("miscellaneousPayment", miscellaneousPaymentSchema);
module.exports = miscellaneousPaymentModel;