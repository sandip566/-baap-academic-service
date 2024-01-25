const mongoose = require("mongoose");

const relegionSchema = new mongoose.Schema(
    {
        relegionId:{
            type:Number,
            required:false
        },
        name:{
            type:String,
            required:false
        }
    },
    { strict: false, timestamps: true }
);
const relegionModel = mongoose.model("relegion", relegionSchema);
module.exports = relegionModel;
