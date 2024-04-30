const mongoose = require("mongoose");


const VehiclePaymentHistorySchema = new mongoose.Schema(
    {

        name: {
            type: String,
            required: true,
        },

        vehicleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle',
            required: true,
        },
        paymentDate: {
            type: Date,
            required: true,
        },
        vehiclepaymenthistoryId: {
            type: Number
        },
        groupId: {
            type: Number,
            required: false,
        },
        amount: {
            type: Number,
            required: true,
        },


    },
    { timestamps: true, strict: false }
);


const VehiclePaymentHistoryModel = mongoose.model("VehiclePaymentHistory", VehiclePaymentHistorySchema);

module.exports = VehiclePaymentHistoryModel;
