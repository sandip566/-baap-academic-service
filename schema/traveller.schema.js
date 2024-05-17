const mongoose = require("mongoose");

const TravellerSchema = new mongoose.Schema(
    {
        groupId:{
            type:Number,
            required:true
        },
        travellerName:{
            type:String,
            required:true
        },
        travellerId:{
            type:Number,
            required:true
        },
        phoneNumber:{
            type:Number,
            required:true
        },
        class:{
            type:String,
            required:true
        },
        division:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
        },
        ParentsName:{
            type:String,
            required:true
        },
        birthDate:{
            type:String,
            required:true
        },
        address:[{
            village: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            }
        }],
        country:{
            type: String,
        },
        KYC:[{
            aadharNumber: {
                type: Number,
                required: true
            },
            panNumber: {
                type: String,
                required: true
            }
        }]
},
    { timestamps: true }
);

const TravellerModel = mongoose.model("traveller", TravellerSchema);
module.exports = TravellerModel;
