const mongoose = require("mongoose");

const BusSchema = new mongoose.Schema(
    {
        busId: {
            type: Number,
            
        },
        Licence_plate:{
            type:Number,
            required:false
        },
        groupId: {
            type: Number,
            required: false,
        },
        Capality:{
            type:String,
            required:false
        },
        Route_Id:{
            type:Number,
            required:false
        },
        model:{
            type:String,
            required:false
        },
        Year:{
            type:Number,
            required:false
        }
    },
    { timestamps: true }
);

const BusModel = mongoose.model("bus", BusSchema);
module.exports = BusModel;
// ./GenerateModule.ps1 "bus"