const mongoose = require("mongoose");

const configurationSchema = new mongoose.Schema(
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

const ConfigrationModel = mongoose.model("configration", configurationSchema);
module.exports = ConfigrationModel;
