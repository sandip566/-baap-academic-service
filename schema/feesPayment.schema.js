const mongoose = require("mongoose");
const feesPaymentSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true,
        },
        addmissionId: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            required: false,
            default: "paid"
        },
        paidAmount: {
            type: String,
            required: false,
            default: "0"
        },
        remainingAmount:{
            type: String,
            required: false,
        },
        empId: {
            type: Number,
            required: true,
        },
        feesPaymentId: {
            type: Number,
        },
        currentDate:{
            type: String,
            required: false,
        },
        academicYear:{
            type: String,
            required: false,
        },
        userId: {
            type: Number,
            required: false,
        },

        // paidAmount: {
        //     type: Number,
        // },
        // installmentId: {
        //     type:Number,
        //     required: false
        // },
        // paymentDate: {
        //     type: Date,
        // },
        // mode: {
        //     type: String,
        //     enum: ["ONLINE", "CASH", "creditCard", "bank transfer"],
        // },
        receivedBy: {
            empId: {
                type: Number,
                required: false
            },
        },
        // feesTemplateId: {
        //     type:Number,
        //     required: false
        // },
        // academicYearsId: {
        //     type:Number,
        //     required: false
        // }
    },
    { strict: false, timestamps: true }
);
feesPaymentSchema.plugin(require("mongoose-autopopulate"));
const FeesModel = mongoose.model("feesPayment", feesPaymentSchema);
module.exports = FeesModel;
