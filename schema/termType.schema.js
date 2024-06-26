const mongoose = require("mongoose");

const TermTypeSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true,
        },
        termTypeId:{
            type:Number
        },
        name:{
            type:String
        },
        academicYearId:{
            type:Number
        }
    },
    { timestamps: true,strict:false }
);

const TermTypeModel = mongoose.model("termtype", TermTypeSchema);
module.exports = TermTypeModel;
