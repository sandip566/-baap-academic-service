const mongoose = require("mongoose");

const AssignedAssetSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false
        },
        assignedId: {
            type: Number,
            required: false
        },
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: false
        },
        category: {
            type: String,
            required: false
        },
        id: {
            type: String,
            required: false
        },
        status: {
            type: String,
            required: false
        },
        condition: {
            type: String,
            required: false
        }
    }, { strict: false, timestamps: true }
);
const AssignedAssetModel = mongoose.model("assignedasset", AssignedAssetSchema);
module.exports = AssignedAssetModel;
