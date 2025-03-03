const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false,
        },
        documentId: {
            type: Number,
        },
        memberId: {
            type: Number,
        },
        userId: {
            type: Number
        },
        roleId: {
            type: Number,
        },
        title: {
            type: String,
            required: false,
        },
        description: {
            type: String,
            required: false,
        },
        compulsory: {
            type: Boolean,
        },
        category: {
            type: String,
        },
        documentUrl: {
            type: String,
        },
    },
    { strict: false, timestamps: true }
);
const DocumentModel = mongoose.model("document", DocumentSchema);
module.exports = DocumentModel;
