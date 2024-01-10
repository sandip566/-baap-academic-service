const mongoose = require("mongoose");

const HostelSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1
        },
        hostelId: {
            type: Number,
            required: true
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            autopopulate:true,
            ref: 'student',
            required:true
        },
        admissionDate: {
            type: Date,
            default: Date.now()
        },
        bedNumber: {
            type: String,
            required: true
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
