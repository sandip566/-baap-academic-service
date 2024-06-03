const mongoose = require("mongoose");

const DriverRoutesSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true,
        },
        routeId: {
            type: Number,
            required: false,
        },
        driverRoutes: {
            type: Array,
            required: true,
        },
        driverId: {
            type: Number,
            required: false,
        },
    },
    { strict: false, timestamps: true }
);

const DriverRoutesModel = mongoose.model("driverroutes", DriverRoutesSchema);
module.exports = DriverRoutesModel;
