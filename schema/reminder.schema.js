const mongoose = require("mongoose");

const ReminderSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1
        },
        reminderId: {
            type: Number,
            required: true
        },
        reminderName: {
            type: String,
            required: true,
        },
        reminderType: {
            type: String
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId
        }
    },
    { strict: false, timestamps: true }
);
ReminderSchema.plugin(require('mongoose-autopopulate'))
const ReminderModel = mongoose.model("reminder", ReminderSchema);
module.exports = ReminderModel;
