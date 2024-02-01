const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false
        },
        departmentName: {
            type: String,
            required: false,
        },
        departmentId: {
            type: Number,
            required: false,
        },
        departmentHead: {
            firstName: String,
            code:Number
        }
    },
    { strict: false, timestamps: true }
);
const DepartmentModel = mongoose.model("Department", departmentSchema);
module.exports = DepartmentModel;
