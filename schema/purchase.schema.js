const mongoose = require("mongoose");

const PurchaseSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false
        },
        purchaseId: {
            type: Number
        },
        vendorId: {
            type: Number,
            required: false
        },
        customerId: {
            type: Number,
            required: false
        },
        purchaseDate: {
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
        book:{
            type:String
        },
        quantity:{
            type:String
        },
        unitPrice:{
            type:Number
        },
        orderStatus: {
            type: String,
            enum: ["Delivered", "Shipped", "Pending","Canceled","Processing"]
        }
    },
    { strict:false,timestamps: true }
);

const PurchaseModel = mongoose.model("purchase", PurchaseSchema);
module.exports = PurchaseModel;
