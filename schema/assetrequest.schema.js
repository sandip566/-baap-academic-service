const mongoose = require("mongoose");

const AssetRequestSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false
        },
        requestId: {
            type: Number,
            required: false
        },
        name: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: false
        },
        type: {
            type: String,
            required: false
        },
        status: {
            type: String,
            required: false
        },
    }, { strict: false, timestamps: true }
);
const AssetRequestModel = mongoose.model("assetrequest", AssetRequestSchema);
module.exports = AssetRequestModel;
