const mongoose = require("mongoose")

const hostelPaymnetSchema = new schema(
    {
        groupId: {
            type: Number,
            require: true
        },
        hostelPaymentId: {
            type: Number
        },
        studentId: {
            type: Number,
            require: false
        },
        hostelId: {
            type: Number,
            require: false
        },
        paymentAmount: {
            type: number
        },
        paymentDate: {
            type: Date,
            default: Date.now()
        },
        recivedBy: {
            memberId: {
                type: number,
                require: false
            }
        }

    },

    { timestamp: true, strict: false }
);
hostelPaymnetSchema.plugin(require("mongoose-autopopulate"));
const hostelPaymnetModel = mongoose.model("hostelPayment", hostelPaymnetSchema)
module.exports = hostelPaymnetModel