const mongoose = require("mongoose");
const product = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false
        },
        productId: {
            type: Number
        },
        name: {
            type: String
        },
        description: {
            type: String
        },
        unitCost: {
            type: Number
        },
        unitPrice: {
            type: Number
        },
        stockQuantity: {
            type: Number
        }
    },
    { strict: false, timestamps: true }
);
const productModel = mongoose.model("product", product);
module.exports = productModel;
