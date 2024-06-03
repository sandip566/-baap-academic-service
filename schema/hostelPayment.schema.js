const mongoose = require("mongoose");

const hostelPaymnetSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            require: true,
        },
        hostelPaymentId: {
            type: Number,
        },
        hostelAdmissionId: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            required: false,
            default: "paid",
        },
        paidAmount: {
            type: String,
            required: false,
            default: "0",
        },
        remainingAmount: {
            type: String,
            required: false,
        },
        empId: {
            type: Number,
            required: true,
        },
        currentDate: {
            type: String,
            required: true,
        },
        
        userId: {
            type: Number,
            required: false,
        },
    },

    { timestamp: true, strict: false }
);
hostelPaymnetSchema.plugin(require("mongoose-autopopulate"));
const hostelPaymnetModel = mongoose.model("hostelPayment", hostelPaymnetSchema);
module.exports = hostelPaymnetModel;
