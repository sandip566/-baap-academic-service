const mongoose = require("mongoose");
const checklistOptions = ["Installement Allowed", "Show in Accounting", "Discount Allowed"];
const feesTemplate = mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false
        },
        feesTemplateId: {
            type: Number,
            required: false
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
        classId: {
            type: Number,
            required: false
        },
        academicYearId: {
            type: Number,
            required: false
        },
        checklist: [{
            type: String,
            // enum: checklistOptions,
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
