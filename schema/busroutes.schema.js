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
            required: true
        },
        start: {
            type: String,
            required: true
        },
        end: {
            type: String,
            required: true
        },
        shift: {
            type: String,
            enum: ['Morning', 'Afternoon', 'Evening'],
            required: true
        },
        driverId: {
            type: Number,
            required: true
        },
        caretakerId: {
            type: Number,
            rrequired: true
        },
        vehicleId: {
            type: String,
            required: true
        },
        routetNumber: {
            type: Number,
            required: true
        },
        feesFreq: {
            type: String,
            enum:['Monthly','Yearly','Half Yearly','Quarterly'],
            required: true
        },
        currentLocaction: {
            lattitude: {
                type: Number,
                required: true
            },
            longitude: {
                type: Number,
                required: true
            },
        },
        stopDetails:{
            type:Array,
            required:true
        }
        // stopDetails: [{
        //     stopName: {
        //         type: String,
        //         required: true
        //     },
        //     fees: {
        //         type: Number,
        //         required: true
        //     },
        //     location: {
        //         lattitude: {
        //             type: Number,
        //             required: true
        //         },
        //         longitude: {
        //             type: Number,
        //             required: true
        //         }
        //     }
        // }]
        
    },
    { strict: false, timestamps: true }
);
const BusRoutesModel = mongoose.model("busroutes", BusRoutesSchema);
module.exports = BusRoutesModel;
