const mongoose = require("mongoose");

// Define schema for document configuration table
const documentConfigurationModel = new mongoose.Schema({
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
    // No documents array here
    documentTitle: String,
    expiryDate: Date,
    formDate: Date,
    // documentUrl: String,
    documntConfigurationId: Number
}, { strict: false, timestamps: true });

// Create mongoose model
const documentConfigurationSchema = mongoose.model(
    "documentConfiguration",
    documentConfigurationModel
);

module.exports = documentConfigurationSchema;
