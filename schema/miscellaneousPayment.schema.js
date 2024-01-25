const mongoose = require('mongoose');
const miscellaneousPaymentSchema = new mongoose.Schema(
    {
        miscellaneousPaymentId: {
            type: Number,
            require: false
        },
        groupId: {
            type: Number,
            default: 1
        },
        amount: {
            type: Number,
        },
        installmentId: {
            type:Number,
            type: mongoose.Schema.Types.ObjectId,
            ref: "feesInstallment",
            autopopulate: false
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
            type:Number,
            type: mongoose.Schema.Types.ObjectId,
            ref: "transaction",
            autopopulate: false
        },
        receivedBy: {
            memberId: {
                type:Number,
                type: mongoose.Schema.Types.ObjectId,
                ref: "member",
                autopopulate: false
            }
        },
        feesTemplateId: {
            type:Number,
            type: mongoose.Schema.Types.ObjectId,
            ref: "feesTemplate",
            autopopulate: false
        },
        academicYearsId: {
            type:Number,
            type: mongoose.Schema.Types.ObjectId,
            ref: "academicyear",
            autopopulate: false
        },
        studentId: {
            type:Number,
            type: mongoose.Schema.Types.ObjectId,
            ref: "student",
            autopopulate: false
        },
    },
    { strict: false, timestamps: true }
);
miscellaneousPaymentSchema.plugin(require("mongoose-autopopulate"))
const miscellaneousPaymentModel = mongoose.model("miscellaneousPayment", miscellaneousPaymentSchema);
module.exports = miscellaneousPaymentModel;