const mongoose = require("mongoose");

const GatepassSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false,
        },
        userId: {
            type: Number,
            required: false
        },
        managerUserId: {
            type: Number,
            required: false
        },
        gatepassId: {
            type: Number,
            required: false
        },
        dateLeaving: {
            type: String,
            required: false
        },
        returnDate: {
            type: String,
            required: false
        },
        reason: {
            type: String,
            strict: false
        },
        status: {
            type: String,
            required: false,
            default: "Active"
        },
        approvedByManager: {
            type: String,
            required: false,
            default: "pending"
        },
        approvedByParent: {
            type: String,
            required: false,
            default: "pending"
        }
    },
    { strict: false, timestamps: true }
);

const GatepassModel = mongoose.model("gatepass", GatepassSchema);
module.exports = GatepassModel;
