const mongoose = require("mongoose");

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
        tutionFees: {
            type: Number
        },
        libraryFees: {
            type: Number
        },
        examFees: {
            type: Number
        },
        hostelFees: {
            type: Number
        },
        messFees: {
            type: Number
        },
        admissionFees: {
            type: Number
        },
        totalFees: {
            type: Number
        },
        originalFees: {
            type: Number
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'course',
            autopopulate: true
        },
        academicYear: {
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: true,
            ref: 'academicyear'
        }
    },
    { strict: false, timestamps: true }
);
feesTemplate.plugin(require("mongoose-autopopulate"));
const feesTemplateModel = mongoose.model("feesTemplate", feesTemplate);
module.exports = feesTemplateModel;
