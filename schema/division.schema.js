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
          
        },
        courseId: {
            type: Number,
            required: true,
          
        },
        Name: {
            type: String,
            required: true
        },
        classId: {
            type: Number,
            required: false
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
