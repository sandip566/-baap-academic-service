const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'course',
            autopopulate: true
        },
        groupId: {
            type: Number,
            default: 1
        },
        classId: {
            type: Number,
            required: true
        },
        duration: {
            type: String
        },
        mode: {
            type: String
        },
        university: {
            type: String
        },
        fees: {
            type: Number
        },
        intakeCapacity: {
            type: Number
        },
        managementIntake: {
            type: Number
        }
    },
    { strict: false, timestamps: true }
);
classSchema.plugin(require('mongoose-autopopulate'));
const ClassModel = mongoose.model('Class', classSchema);
module.exports = ClassModel;
