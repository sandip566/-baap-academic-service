const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course' 
    },
    groupId: {
        type: Number,
        default: 1
    },
    classId: {
        type: Number,
        required: true,
        unique: true
    },
});
classSchema.plugin(require('mongoose-autopopulate'))
const ClassModel = mongoose.model('Class', classSchema);

module.exports = ClassModel;
