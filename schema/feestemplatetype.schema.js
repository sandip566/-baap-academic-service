const mongoose = require("mongoose");

const FeesTemplateTypeSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true,
        },
        feesTemplateTypeId: {
            type: Number,
            required: false,
        },
        name: {
            type: String,
            required: true,
        },
    },
    { strict: false, timestamps: true }
);

const FeesTemplateTypeModel = mongoose.model(
    "feestemplatetype",
    FeesTemplateTypeSchema
);
module.exports = FeesTemplateTypeModel;
