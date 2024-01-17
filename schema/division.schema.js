const mongoose = require("mongoose");
const DivisionSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1
        },
        divisionId: {
            type: Number,
            required: true,
            unique: true
        },
        Name: {
            type: String,
            required: true
        },
        Class:{
            type:mongoose.Schema.Types.ObjectId,
            autopopulate:true,
            ref: 'class'
        },
        StartTime: {
            type: String,
            required: true
        },
        EndTime: {
            type: String,
            required: true
        },
        Classroom: {
            type: String,
            required: true
        },
        Incharge: {
            type: String
        }
    },
    { strict: false, timestamps: true }
);
DivisionSchema.plugin(require("mongoose-autopopulate"));
const DivisionModel = mongoose.model("division", DivisionSchema);
module.exports = DivisionModel;
