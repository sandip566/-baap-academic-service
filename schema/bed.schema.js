const mongoose = require("mongoose");

const BedSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true
          },
        name: {
            type: String,
            required: false,
        },
        bedId:{
            type:Number,
            strict: false
        },
        bedNumber:{
            type:Number,
            strict: true
        },
        status:{
            type: String,
            required: false,
            default: "available"
          }
    },
    {strict:false, timestamps: true }
);

const BedModel = mongoose.model("bed", BedSchema);
module.exports = BedModel;
