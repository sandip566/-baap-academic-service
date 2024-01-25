const mongoose = require("mongoose");

const HostelSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1
        },
        hostelId: {
            type: Number,
            default: 11,
        },
        hostelerId: {
            type: Number,
            required: false
        },
        student: {
            type:Number,
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: false,
            ref: 'student',
            required: false
        },
        admissionDate: {
            type: Date,
            default: Date.now()
        },
        bedNumber: {
            type: String,
            required: false
        },
        admissionStatus: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending'
        },
    },
    { strict: false, timestamps: true }
);
HostelSchema.plugin(require("mongoose-autopopulate"));
const HostelModel = mongoose.model("hostel", HostelSchema);
module.exports = HostelModel;
