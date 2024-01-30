const mongoose = require('mongoose');
const miscellaneousPaymentSchema = new mongoose.Schema(
    {
        miscellaneousPaymentId: {
            type: Number,
            require: false
        },
        groupId: {
            type: Number,
            required: false
        },
        amount: {
            type: Number,
        },
        installmentId: {
            type: Number,
            required: false
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
            type: Number,
            required: false
        },
        receivedBy: {
            empId: {
                type: Number,
                required: false
            }
        },
        feesTemplateId: {
            type: Number,
            required: false
        },
        academicYearsId: {
            type: Number,
            required: false
        },
        studentId: {
            type: Number,
            required: false
        },
    },
    { strict: false, timestamps: true }
);
miscellaneousPaymentSchema.plugin(require("mongoose-autopopulate"))
const miscellaneousPaymentModel = mongoose.model("miscellaneousPayment", miscellaneousPaymentSchema);
module.exports = miscellaneousPaymentModel;