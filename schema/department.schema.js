const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1
        },
        departmentName: {
            type: String,
            required: false,
        },
        departmentId: {
            type: Number,
            required: false,
            unique: false,
        },
        departmentHead: {
            firstName: {
                type: String,
                required: false,
            },
            code: {
                type: String,
                required: false,
            },
        },
    },
    { strict: false, timestamps: true }
);
const DepartmentModel = mongoose.model("Department", departmentSchema);
module.exports = DepartmentModel;
