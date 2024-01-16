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
            type: mongoose.Schema.Types.ObjectId,
            ref: "feesInstallment",
            //autopopulate: true,
        },
        paymentDate: {
            type: Date,
        },
        mode: {
            type: String,
            enum: ["ONLINE", "CASH","creditCard","bank transfer"],
        },
        // transactionId: {
        //     type:Number
        // },
        receivedBy: {
            memberId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "member",
                autopopulate: true,
            },
        },
        feesTemplateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "feesTemplate",
            autopopulate: true,
        },
        academicYearsId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "academicyear",
            autopopulate: true,
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "student",
            autopopulate: true,
        },
    },
    { strict: false, timestamps: true }
);
feesPaymentSchema.plugin(require("mongoose-autopopulate"));
const FeesModel = mongoose.model("feesPayment", feesPaymentSchema);
module.exports = FeesModel;
