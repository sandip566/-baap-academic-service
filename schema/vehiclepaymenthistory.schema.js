const mongoose = require("mongoose");

// Define the schema for Vehicle Payment History
const VehiclePaymentHistorySchema = new mongoose.Schema(
    {
        // Name or identifier of the payment record
        name: {
            type: String,
            required: true,
        },
        // You can add more fields here according to your requirements
        // For example:
        vehicleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle', // Assuming you have a Vehicle model
            required: true,
        },
        paymentDate: {
            type: Date,
            required: true,
        },
        vehiclepaymenthistoryId:{
            type:Number
        },
        groupId: {
            type: Number,
            required: false,
        },
        amount: {
            type: Number,
            required: true,
        },
        
        // Other fields like payment method, invoice number, etc. can be added
    },
    { timestamps: true } // This will automatically add createdAt and updatedAt fields
);

// Create a Mongoose model based on the schema
const VehiclePaymentHistoryModel = mongoose.model("VehiclePaymentHistory", VehiclePaymentHistorySchema);

module.exports = VehiclePaymentHistoryModel;
