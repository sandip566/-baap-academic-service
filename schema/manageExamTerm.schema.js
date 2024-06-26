const mongoose = require("mongoose");

const ManageExamTermSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true,
        },
        manageExamTermId:{
            type:Number
        },
        name:{
            type:String
        },
        priority:{
            type:Number
        },
        classId:{
         type:Number
        },
        termType:{
            type:String
        },
        academicYearId:{
            type:Number
        }
    },
    { timestamps: true,strict:false }
);

const ManageExamTermModel = mongoose.model("manageexamterm", ManageExamTermSchema);
module.exports = ManageExamTermModel;
