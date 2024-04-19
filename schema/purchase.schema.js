const mongoose = require("mongoose");

const PurchaseSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false,
        },
        purchaseId: {
            type: Number,
        },
        vendorId: {
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
        publisherId:{
         type:Number
        },
        totalAmount: {
            type: Number,
        },
        paymentMethod: {
            type: String,
            enum: ["Upi", "Cash", "Cheque"],
        },
        // items: [{
        //     book: {
        //         type: String
        //     },
        //     quantity: {
        //         type: Number,
        //         required: false
        //     },
        //     unitPrice: {
        //         type: Number,
        //         required: false
        //     }
        // }],
        book: {
            type: String,
        },
        quantity: {
            type: Number,
        },
        unitPrice: {
            type: Number,
        },
        orderStatus: {
            type: String,
            enum: ["Delivered", "Shipped", "Pending", "Canceled", "Processing"],
        },
    },
    { strict: false, timestamps: true }
);

const PurchaseModel = mongoose.model("purchase", PurchaseSchema);
module.exports = PurchaseModel;
