const mongoose = require("mongoose");

const ConfigrationSchema = new mongoose.Schema(
    {
        groupId:{
            type:Number,
            require:true
        },
        configrationId:{
            type:Number
        }
    },
    { timestamps: true ,strict:false}
);

const ConfigrationModel = mongoose.model("configration", ConfigrationSchema);
module.exports = ConfigrationModel;
