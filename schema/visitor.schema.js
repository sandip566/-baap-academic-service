const mongoose = require("mongoose");

const VisitorSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1,
            required: true
        },
        visitorId: {
            type: Number
        },
        visitorName: {
            type: String
        },
        visitorAddress: {
            type: String
        },
        visitorPhoneNo: {
            type: Number
        }
    },
    { strict: false, timestamps: true }
);
const VisitorModel = mongoose.model("visitor", VisitorSchema);
module.exports = VisitorModel;
