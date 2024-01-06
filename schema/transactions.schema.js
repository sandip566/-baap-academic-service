const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1
        },
        transactionId: {
            type: Number,
            unique: true,
        },
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: true,
            required: true,
            ref: 'vendor'
        },
        customerId: {
            type: Number,
            required: true
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
                required: true
            },
            unitPrice: {
                type: Number,
                required: true
            }
        }],
    },
    { strict: false, timestamps: true }
);
transactionSchema.plugin(require('mongoose-autopopulate'));
const TransactionModel = mongoose.model("transaction", transactionSchema);
module.exports = TransactionModel;
