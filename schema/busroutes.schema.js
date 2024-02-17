const mongoose = require("mongoose");
const BusRoutesSchema = new mongoose.Schema(
    {
        routeId: {
            type: Number,
            unique: true
        },
        routeName: {
            type: String
        },
        stops: {
            type: [Number]
        },
        busId: {
            type: Number
        },
        schedule: {
            type: String
        },
       
        groupId: {
            type: Number
        }
    },
    { strict: false, timestamps: true }
);
const BusRoutesModel = mongoose.model("busroutes", BusRoutesSchema);
module.exports = BusRoutesModel;
