const mongoose = require("mongoose");
const checklistOptions = [
    "Installement Allowed",
    "Show in Accounting",
    "Discount Allowed",
];
const feesTemplate = mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true,
        },
        feesTemplateId: {
            type: Number,
        },
        name: {
            type: String,
        },
        cast: {
            type: String,
            required: false,
        },
        totalFees: {
            type: Number,
        },
        originalFees: {
            type: Number,
        },
        classId: {
            type: Number,
            required: false,
        },

        academicYear: {
            type: Number,
            required: false,
        },
        addmissionId: {
            type: Number,
            required: false,
        },
        checklist: [
            {
                type: String,
                // enum: checklistOptions,
                default: [],
            },
        ],
        components: [
            {
                name: String,
                tax: Number,
                scholarship: Number,
                total: Number,
            },
        ],
    },
    { strict: false, timestamps: true }
);
feesTemplate.plugin(require("mongoose-autopopulate"));
const feesTemplateModel = mongoose.model("feesTemplate", feesTemplate);
module.exports = feesTemplateModel;
