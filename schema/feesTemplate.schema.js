const mongoose = require("mongoose");
const checklistOptions = ["Installement Allowed", "Show in Accounting", "Discount Allowed"];
const feesTemplate = mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1,
            required: true
        },
        feesTemplateId: {
            type: Number,
            required: true,
            unique: true
        },
        cast: {
            type: String,
            required: true
        },
        totalFees: {
            type: Number
        },
        originalFees: {
            type: Number
        },
        class: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'class',
            autopopulate: true
        },
        academicYear: {
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: true,
            ref: 'academicyear'
        },
        checklist: [{
            type: String,
            enum: checklistOptions,
            default: []
        }],
        components: [
            {
                name: String,
                tax: Number,
                scholarship: String,
                total: Number
            }
        ]
    },
    { strict: false, timestamps: true }
);
feesTemplate.plugin(require("mongoose-autopopulate"));
const feesTemplateModel = mongoose.model("feesTemplate", feesTemplate);
module.exports = feesTemplateModel;
