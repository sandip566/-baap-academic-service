const mongoose = require("mongoose");

const relegion = new mongoose.Schema(
    {
        relegionId:{
            type:Number,
            required:true
        },
        name:{
            type:String,
            required:true
        }
    },
    { strict: false, timestamps: true }
);
const relegionModel = mongoose.model("relegion", relegion);
module.exports = relegionModel;
