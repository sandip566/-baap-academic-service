const mongoose = require("mongoose");

const TravellerSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true
        },
        travellerId: {
            type: Number,
            required: true
        },
        empId: {
            type: Number,
            required: true
        },
        startDate: {
            type: String,
            required: true
        },
        endDate: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['Draft', 'Comfirmed', 'Cancelled'],
            required: true
        },
        stopId: {
            type: Number,
            required: true
        },
        totalFees: {
            type: Number,
            required: true
        }
    },
    { timestamps: true }
);

const TravellerModel = mongoose.model("traveller", TravellerSchema);
module.exports = TravellerModel;
