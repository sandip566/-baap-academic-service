const mongoose = require("mongoose");
const HostelSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false,
        },
        hostelId: {
            type: Number,
            required: false,
        },
        hostelName: {
            type: String,
            required: true,
        },

        nameOfHead: {
            type: String,
            required: true,
        },
        numberOfFloors: {
            type: Number,
            required: true,
        },
        numberOfBeds: {
            type: Number,
            required: true,
        },
        totalAccupiedBed: {
            type: Number,
            required: true,
        },
        totalVacantBed: {
            type: Number,
            required: true,
        },
        hostelAddress: [
            {
                address1: {
                    type: String,
                    required: true,
                },
                pincode: {
                    type: Number,
                    required: false,
                },
                District: {
                    type: String,
                    require: true,
                },
                state: {
                    type: String,
                    required: true,
                },

                country: {
                    type: String,
                    required: true,
                },
            },
        ],

        hosteladmissionDate: {
            type: Date,
            default: Date.now(),
        },

        hosteladmissionStatus: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },
    },
    { strict: false, timestamps: true }
);
HostelSchema.plugin(require("mongoose-autopopulate"));
const HostelModel = mongoose.model("hostel", HostelSchema);
module.exports = HostelModel;
