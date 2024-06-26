const mongoose = require("mongoose");

const MarksheetNameSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true,
        },
        markSheetId:{
            type:Number
        },
        classId:{
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

const MarksheetNameModel = mongoose.model("marksheetname", MarksheetNameSchema);
module.exports = MarksheetNameModel;
