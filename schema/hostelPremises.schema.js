const mongoose = require("mongoose");
const HostelSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true,
        },
        hostelId: {
            type: Number,
            required: false,
        }
    },
    { strict: false, timestamps: true }
);
HostelSchema.plugin(require("mongoose-autopopulate"));
const HostelModel = mongoose.model("hostelPremises", HostelSchema);
module.exports = HostelModel;
