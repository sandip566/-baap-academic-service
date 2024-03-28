const mongoose = require("mongoose");
const LatefeepaymentSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false,
        },
        lateFeePaymentId: {
            type: Number,
            required: false,
        },
        empId: {
            type: Number,
            required: false,
        },
        lateFeeAmount: {
            type: Number,
            required: false,
        },
        paymentDate: {
            type: Date,
            required: false,
        },
        paymentStatus: {
            type: String,
            enum: ["paid", "Pending", "Failed", "Refunded"],
            default: "pending",
        },
    },
    { strict: false, timestamps: true }
);
LatefeepaymentSchema.plugin(require("mongoose-autopopulate"));
const LatefeepaymentModel = mongoose.model(
    "latefeepayment",
    LatefeepaymentSchema
);
module.exports = LatefeepaymentModel;
