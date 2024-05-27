const mongoose = require("mongoose");

const TransportCoordinatorSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true
        },
        empId: {
            type: Number,
            required: true
        },
        
        dateOfBirth: {
            type: String,
            required: false
        },
        fitnessCertificate: {
            type: String,
            required: false
        },
        startDate: {
            type: String,
            required: false
        },
        endDate: {
            type: String,
            required: false
        }
    },
    { timestamps: true, strict: false }
);

const TransportCoordinatorModel = mongoose.model("transportcoordinator", TransportCoordinatorSchema);
module.exports = TransportCoordinatorModel;
