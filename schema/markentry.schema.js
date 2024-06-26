const mongoose = require("mongoose");

const MarkEntrySchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required:true
        },
    },
    {strict:false, timestamps: true }
);

const MarkEntryModel = mongoose.model("markentry", MarkEntrySchema);
module.exports = MarkEntryModel;
