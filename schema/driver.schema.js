const mongoose = require("mongoose");

const DriverSchema = new mongoose.Schema(
    {
        driver_name: {
            type: String,
            required: true,
        },
        driverId:{
            type:Number,
            required:false
        },
        driver_No:{
            type:Number,
            required:true
        },
        driver_Count:{
            type:Number,
            require:true
        },
        driver_address:{
            type:String,
            required:true
        },
        bus_Id:{
            type:Number,
            
        },
        groupId: {
            type: Number,
            required: false,
        },
        driver_Licence_No:{
            type:Number,
            required:true
        },
        driverJoing_Date:{
            type:Number,
            required:true
        }
    },
    { timestamps: true }
);

const DriverModel = mongoose.model("driver", DriverSchema);
module.exports = DriverModel;
