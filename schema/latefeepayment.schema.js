const mongoose = require("mongoose");

const LatefeepaymentSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1
        },
        lateFeePaymentId: {
            type: Number,
            required: false,
        },
        studentId: {
            type:Number,
            type: mongoose.Schema.Types.ObjectId,
            ref: 'student',
            required: false
        },
        lateFeeAmount: {
            type: Number,
            required: false
        },
        paymentDate: {
            type: Date,
            required: false
        },
        paymentStatus: {
            type: String,
            enum: ["paid", "Pending", "Failed", "Refunded"],
            default: "pending"
        }
    },
    { strict: false, timestamps: true }
);
LatefeepaymentSchema.plugin(require("mongoose-autopopulate"));
const LatefeepaymentModel = mongoose.model("latefeepayment", LatefeepaymentSchema);
module.exports = LatefeepaymentModel;
