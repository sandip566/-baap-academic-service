const mongoose = require("mongoose");
const attendanceSchema = new mongoose.Schema(
    {
        attendanceId: Number,
        groupId: {
            type: Number,
            required: false,
        },
        name: {
            type: Number,
            required: false,
        },
        timeIn: {
            type: Number,
        },
        timeOut: {
            type: Number,
        },
        present: {
            type: Boolean,
        },
        absent: {
            type: Boolean,
        },
        dateOfleave: {
            type: Date,
        },
        reasonOfAbsent: {
            type: String,
        },
        lateArrival: {
            type: Boolean,
        },
        reasonOfLateArrival: {
            type: String,
        },
        isPreInformedOfAbsent: {
            type: Boolean,
        },
        remark: {
            type: String,
        },
    },
    { strict: false, timestamps: true }
);
attendanceSchema.plugin(require("mongoose-autopopulate"));
const attendanceModel = mongoose.model("attendance", attendanceSchema);
module.exports = attendanceModel;
