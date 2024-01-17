const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1
        },
        departmentName: {
            type: String,
            required: true,
        },
        departmentId: {
            type: Number,
            required: true,
            unique: true,
        },
        departmentHead: {
            firstName: {
                type: String,
                required: true,
            },
            code: {
                type: String,
                required: true,
            },
        },
    },
    { strict: false, timestamps: true }
);

const DepartmentModel = mongoose.model("Department", departmentSchema); 
module.exports = DepartmentModel;
