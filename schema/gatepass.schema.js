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
        gatepassId: {
            type: Number,
            required: false
        },
        dateLeaving: {
            type: Date,
            required: false
        },
        returnDate: {
            type: Date,
            required: false
        },
        reason: {
            type: String,
            strict: false
        },
        status: {
            type: String,
            required: false
        }
    },
    { strict: false, timestamps: true }
);

const GatepassModel = mongoose.model("gatepass", GatepassSchema);
module.exports = GatepassModel;
