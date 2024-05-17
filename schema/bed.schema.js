const mongoose = require("mongoose");

const BedSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true
          },
        name: {
            type: String,
            required: true,
        },
        bedId:{
            type:Number,
            strict: false
        }
    },
    {strict:false, timestamps: true }
);

const BedModel = mongoose.model("bed", BedSchema);
module.exports = BedModel;
