const mongoose = require("mongoose");
const documentConfigrationModel = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false
        },
       documents:[{
       documntConfigurationId:Number
    }] ,
    },
    { strict: false, timestamps: true }
);
const documentConfigrationSchema = mongoose.model("documentConfigration", documentConfigrationModel);
module.exports = documentConfigrationSchema;
