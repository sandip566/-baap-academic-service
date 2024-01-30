const mongoose = require("mongoose");

const religionSchema = new mongoose.Schema(
    {
        religionId:{
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
const religionModel = mongoose.model("religion", religionSchema);
module.exports = religionModel;     
