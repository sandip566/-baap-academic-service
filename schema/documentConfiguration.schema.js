const mongoose = require("mongoose");
const documentConfigrationModel = new mongoose.Schema(
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
const documentConfigrationSchema = mongoose.model(
    "documentConfigration",
    documentConfigrationModel
);
module.exports = documentConfigrationSchema;
