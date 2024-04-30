const mongoose = require("mongoose");

const TripHistorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        // You can add more fields here according to your requirements
        // For example:
        date: {
            type: Date,
            required: true,
        },
        origin: {
            type: String,
            required: true,
        },
        destination: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const TripHistoryModel = mongoose.model("triphistory", TripHistorySchema);
module.exports = TripHistoryModel;
