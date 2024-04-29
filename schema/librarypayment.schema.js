const mongoose = require("mongoose");

const LibraryPaymentSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number
        },
        empId: {
            type: Number
        },
        libraryPaymentId: {
            type: Number
        },
        userId: {
            type: Number
        },
        paidAmount: {
            type: Number
        },
        totalAmountToPaid: {
            type: Number
        },
        remeningAmount: {
            type: Number
        },
        description:{

        }
    },
    { timestamps: true,statics:false }
);

const LibraryPaymentModel = mongoose.model("librarypayment", LibraryPaymentSchema);
module.exports = LibraryPaymentModel;
