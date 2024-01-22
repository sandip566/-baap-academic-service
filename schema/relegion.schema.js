const mongoose = require("mongoose");

const relegionSchema = new mongoose.Schema(
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
const relegionModel = mongoose.model("relegion", relegionSchema);
module.exports = relegionModel;
