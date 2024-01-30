const mongoose = require("mongoose");
const DocumentSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false
        },
        rollId: {
            type: Number
        },
        name: {
            type: String,
            required: false,
        },
        description: {
            type: String,
            required: false
        }
    },
    { strict: false, timestamps: true }
);
const DocumentModel = mongoose.model("document", DocumentSchema);
module.exports = DocumentModel;
