const mongoose = require("mongoose");
const DivisionSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false,
        },
        divisionId: {
            type: Number,
            required: false,
        },
        courseId: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
            required: false,
        },
        classId: {
            type: Number,
            required: true,
        },
        classroom: {
            type: String,
            required: false,
        },
        incharge: {
            type: String,
        },
    },
    { strict: false, timestamps: true }
);
DivisionSchema.plugin(require("mongoose-autopopulate"));
const DivisionModel = mongoose.model("division", DivisionSchema);
module.exports = DivisionModel;
