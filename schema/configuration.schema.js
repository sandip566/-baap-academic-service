const mongoose = require("mongoose");

const configurationSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            require: true
        },
        configurationId: {
            type: Number
        }
    }, { timestamps: true, strict: false }
);

const ConfigurationModel = mongoose.model("configuration", configurationSchema);
module.exports = ConfigurationModel;
