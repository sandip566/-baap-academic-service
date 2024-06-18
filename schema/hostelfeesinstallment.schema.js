const mongoose = require("mongoose");

const HostelFeesInstallmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        groupId: {
            type: Number,
            required: true,
        },
        hostelInstallmentId: {
            type: Number,
            required: true,
            unique: true
        },
        hostelAdmissionId: {
            type: Number,
            required: false,
        },
        status: {
            type: String,
            default: "pending",
        },


        isActive: {
            type: Boolean,
            default: true
        },
        deletedByUsers: [
            {
                userId: {
                    type: String,
                    required: true,
                },
                deletedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    { strict: false, timestamps: true }
);

HostelFeesInstallmentSchema.virtual('statusFlag').get(function () {
    return this.deleted ? 'inactive' : 'active';
});

HostelFeesInstallmentSchema.set('toJSON', {
    virtuals: true
});
HostelFeesInstallmentSchema.set('toObject', {
    virtuals: true
});

const HostelFeesInstallmentModel = mongoose.model("hostelfeesinstallment", HostelFeesInstallmentSchema);
module.exports = HostelFeesInstallmentModel;
