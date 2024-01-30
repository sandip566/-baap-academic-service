const mongoose = require("mongoose");
const transactionSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false
        },
        transactionId: {
            type: Number,
            unique: false,
        },
        vendorId: {
            type: Number,
            required: false
        },
        customerId: {
            type: Number,
            required: false
        },
        transactionDate: {
            type: Date,
            default: Date.now()
        },
        totalAmount: {
            type: Number
        },
        paymentMethod: {
            type: String,
            enum: ["upi", "cash", "cheque"]
        },
        items: [{
            book: {
                type: String
            },
            quantity: {
                type: Number,
                required: false
            },
            unitPrice: {
                type: Number,
                required: false
            }
        }],
    },
    { strict: false, timestamps: true }
);
transactionSchema.plugin(require('mongoose-autopopulate'));
const TransactionModel = mongoose.model("transaction", transactionSchema);
module.exports = TransactionModel;
