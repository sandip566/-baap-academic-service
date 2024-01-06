const mongoose = require("mongoose");

const DivisionSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1
        },
        divisionId: {
            type: Number,
            required: true,
            unique: true
        },
        divisionName: {
            type: String,
            required: true
        },
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        }
    },
    { strict: false, timestamps: true }
);
const DivisionModel = mongoose.model("division", DivisionSchema);
module.exports = DivisionModel;
