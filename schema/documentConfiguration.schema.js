const mongoose = require("mongoose");
const documentConfigurationModel = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false,
        },
        academicYear: {
            type: Number,
            required: false,
        },
        empId: {
            type: Number,
            required: false,
        },
        addmissionId: {
            type: Number,
            required: false,
        },

        userId: {
            type: Number,
        },
        roleId: {
            type: Number,
        },
        documents: [
            {
                documntConfigurationId: Number,
            },
        ],
    },
    { strict: false, timestamps: true }
);
const documentConfigurationSchema = mongoose.model(
    "documentConfiguration",
    documentConfigurationModel
);
module.exports = documentConfigurationSchema;
