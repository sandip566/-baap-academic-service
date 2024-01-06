const mongoose = require("mongoose");

const LatefeepaymentSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1
        },
        lateFeePaymentId: {
            type: Number,
            required: true,
        },
        // studentId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'student',
        //     required: true
        // },
        lateFeeAmount: {
            type: Number,
            required: true
        },
        paymentDate: {
            type: Date,
            required: true
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
