const mongoose = require("mongoose");

const DriverSchema = new mongoose.Schema(
    {
        driverName: {
            type: String,
            required: true,
        },
        driverId: {
            type: Number,
            required: false
        },
        driverNo: {
            type: Number,
            required: true
        },
        driverCount: {
            type: Number,
            require: true
        },
        driverAddress: {
            type: String,
            required: true
        },
        busId: {
            type: Number,

        },
        groupId: {
            type: Number,
            required: false,
        },
        driverLicenceNo: {
            type: Number,
            required: true
        },
        driverJoingDate: {
            type: Number,
            required: true
        }
    },
    { timestamps: true ,strict:false}
);

const DriverModel = mongoose.model("driver", DriverSchema);
module.exports = DriverModel;
