const mongoose = require("mongoose");

const ReminderSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1
        },
        reminderId: {
            type: Number,
            required: false
        },
        reminderName: {
            type: String,
            required: false,
        },
        reminderType: {
            type: String
        },
        courseId: {
            type:Number,
            required: false
        }
    },
    { strict: false, timestamps: false }
);
ReminderSchema.plugin(require('mongoose-autopopulate'));
const ReminderModel = mongoose.model("reminder", ReminderSchema);
module.exports = ReminderModel;
