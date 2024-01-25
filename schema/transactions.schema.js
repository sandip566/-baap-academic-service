const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1
        },
        transactionId: {
            type: Number,
            unique: false,
        },
        vendorId: {
            type:Number,
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: false,
            required: false,
            ref: 'vendor'
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
