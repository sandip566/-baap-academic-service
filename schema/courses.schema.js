const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false
        },
        courseId: Number,
        name: {
            required: false,
            type: String
        },
        duration: {
            type: String,
            required: false,
        },
        mode: {
            type: String,
            required: false
        },
        university: {
            type: String,
            required: false
        },
        fees: {
            type: Number
        }
    },
    { strict: false, timestamps: true }
);
courseSchema.plugin(require("mongoose-autopopulate"));
const courseModel = mongoose.model("course", courseSchema);
module.exports = courseModel;
