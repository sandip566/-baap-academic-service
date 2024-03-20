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
        remainingAmount: {
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
        currentDate: {
            type: String,
            required: false,
        },
        academicYear: {
            type: String,
            required: false,
        },
        userId: {
            type: Number,
            required: false,
        },

        
        installmentId: {
            type:Number,
            required: false
        },
        
        receivedBy: {
            empId: {
                type: Number,
                required: false
            },
        },
      
    },
    { strict: false, timestamps: true }
);
feesPaymentSchema.plugin(require("mongoose-autopopulate"));
const FeesModel = mongoose.model("feesPayment", feesPaymentSchema);
module.exports = FeesModel;
