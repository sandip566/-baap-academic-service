const mongoose = require("mongoose");
const checklistOptions = ["Installement Allowed", "Show in Accounting", "Discount Allowed"];
const feesTemplate = mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1,
            required: false
        },
        feesTemplateId: {
            
            type: Number,
            required: false,
            unique: false
        },
        cast: {
            type: String,
            required: false
        },
        totalFees: {
            type: Number
        },
        originalFees: {
            type: Number
        },
        class: {
            type:Number,
            type: mongoose.Schema.Types.ObjectId,
            ref: 'class',
            autopopulate: false
        },
        academicYear: {
            type:Number,
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: false,
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
