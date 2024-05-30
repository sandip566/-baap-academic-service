const mongoose = require("mongoose");

const PurchaseSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false,
        },
        purchaseId: {
            type: Number,
            required: false,
        },
        publisherId: {
            type: Number,
            required: false,
        },
        customerName: {
            type: String,
            required: false,
        },
        purchaseDate: {
            type: Date,
            default: Date.now(),
        },
        publisherId: {
            type: Number,
            required: false,
        },
        totalAmount: {
            type: Number,
            required: false,
        },
        paymentMethod: {
            type: String,
            enum: ["Upi", "Cash", "Cheque"],
        },
        name: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: false,
        },
        unitPrice: {
            type: Number,
            required: false,
        },
        orderStatus: {
            type: String,
            enum: ["Delivered", "Shipped", "Pending", "Canceled", "Processing"],
        },
        ISBN: {
            type: String,
            required: false
        }
    },
    { strict: false, timestamps: true }
);

const PurchaseModel = mongoose.model("purchase", PurchaseSchema);
module.exports = PurchaseModel;
