const mongoose = require("mongoose");
const BusRoutesSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            unique: true,
        },
        routeId: {
            type: Number,
            unique: true,
        },
        routeName: {
            type: String,
            required:true
        },
        busName:{
            type:String
        },
        shift:{
            type:String,
            enum:['Morning','Afternoon','Evening'],
            required:true
        },
        routetNumber: {
            type: Number,
        },
        driverId: {
            type: Number,
            required:true
        },
        caretakerId: {
            type: Number,
            rrequired:true
        },
        transportCoordinatorId:{
            type: Number,
            rrequired:true
        },
        location: {
            type: {
                type: String,
                default: 'Point'
            },
            coordinates: [Number]
        }
    },
    { strict: false, timestamps: true }
);
const BusRoutesModel = mongoose.model("busroutes", BusRoutesSchema);
module.exports = BusRoutesModel;
