const mongoose = require("mongoose");

const DivisionSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1
        },
        divisionId: {
            type: Number,
            required: false,
          
        },
        courseId: {
            type: Number,
            required: false,
          
        },
        Name: {
            type: String,
            required: false
        },
        classId: {
            type: Number,
            required: false
        },
        StartTime: {
            type: String,
            required: false
        },
        EndTime: {
            type: String,
            required: false
        },
        Classroom: {
            type: String,
            required: false
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
