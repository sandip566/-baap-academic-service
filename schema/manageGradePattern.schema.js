const mongoose = require("mongoose");

const ManageGradePatternSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true,
        },
        name:{
            type:String
        },
        gradePatternId:{
            type:Number
        },
        grade:{
            type:String
        },
        floorValue:{
            type:Number
        },
        ceilingValue:{
            type:Number
        },
        gradePoint:{
            type:Number
        },
        remark:{
            type:String
        }
    },
    { timestamps: true }
);

const ManageGradePatternModel = mongoose.model("managegradepattern", ManageGradePatternSchema);
module.exports = ManageGradePatternModel;
