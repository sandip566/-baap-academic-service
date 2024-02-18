const mongoose = require("mongoose");
const religionSchema = new mongoose.Schema(
    {
        religionId: {
            type: Number,
            required: false
        },
        groupId: {
            type: Number,
            required: false
        },
        religion:{
            type:String,
            required:false
        }
    },
    { strict: false, timestamps: true }
);
const religionModel = mongoose.model("religion", religionSchema);
module.exports = religionModel;     
