const mongoose = require("mongoose");

const TransportCoordinatorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        transportcoordinatorId:{
            type:Number
        },
        phone: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const TransportCoordinatorModel = mongoose.model("transportcoordinator", TransportCoordinatorSchema);
module.exports = TransportCoordinatorModel;
