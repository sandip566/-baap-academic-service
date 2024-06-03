const mongoose = require("mongoose");

const TravellerStopSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        }
    },
    { timestamps: true }
);

const TravellerStopModel = mongoose.model("travellerstop", TravellerStopSchema);
module.exports = TravellerStopModel;
