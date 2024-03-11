const mongoose = require('mongoose');
const publisherSchema = new mongoose.Schema(
    {
       
        
        groupId: {
            type: Number,
            required: false
        },
        publisherId:{
          type:Number
        },
        publisherName: {
            type: String,
            required: false
        },
       address:{
        type:String,
       },
       phoneNumber:{
          type:Number,
       },
       website:String,
       discription:{
        type:String,
       }
       
    },
    { strict: false, timestamps: true }
);
publisherSchema.plugin(require("mongoose-autopopulate"));
const publisherModel = mongoose.model("publisher", publisherSchema);
module.exports = publisherModel;
