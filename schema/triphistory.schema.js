const mongoose = require("mongoose");

const TripHistorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },

        date: {
            type: Date,
            required: true,
        },
        origin: {
            type: String,
            required: true,
        },
        tripHistoryId: {
            type: Number
        },
        groupId: {
            type: Number,
            required: false,
        },
        destination: {
            type: String,
            required: true,
        },
    },
    { timestamps: true,strict:false }
);

const TripHistoryModel = mongoose.model("triphistory", TripHistorySchema);
module.exports = TripHistoryModel;
