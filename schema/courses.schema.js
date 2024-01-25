const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1
        },
        courseId: Number,
        Code: {
            type: Number,
            
        },
        CourseName: {
            required: false,
            type: String
        },
        Duration: {
            type: String,
            required: false,
        },
        Mode: {
            type: String,
            required: false
        },
        University: {
            type: String,
            required: false
        },
        Fees: {
            type: Number
        }
    },
    { strict: false, timestamps: true }
);
courseSchema.plugin(require("mongoose-autopopulate"));
const courseModel = mongoose.model("course", courseSchema);
module.exports = courseModel;
