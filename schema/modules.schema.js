const mongoose = require("mongoose");

const ModulesSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true,
        },
        moduleId: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
            required: false,
        },
        icon: {
            type: String,
            required: false,
        },
        badges:{
            type: Number,
            required: false,
        },
        theme: {
            backgroundColor: {
                type: String,
                required: false
            },
            fontColor: {
                type: String,
                required: false
            }
        }
    },
    { strict: false, timestamps: true }
);

const ModulesModel = mongoose.model("modules", ModulesSchema);
module.exports = ModulesModel;
