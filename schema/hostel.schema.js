const mongoose = require("mongoose");
const HostelSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false
        },
        hostelId: {
            type: Number,
            default: 11,
        },
        hostelerId: {
            type: Number,
            required: false
        },
        empId: {
            type: Number,
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
