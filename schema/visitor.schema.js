const mongoose = require("mongoose");

const VisitorSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false
        },
        visitorId: {
            type: Number
        },
        name: {
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
