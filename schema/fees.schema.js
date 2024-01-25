const mongoose = require('mongoose');

const feesSchema = new mongoose.Schema(
  {
    groupId: {
      type: Number,
      required: false
    },
    empId: {
      type: Number,
      required: false
    },
    userId: {

      type: String,
      required: false
    },
    feesType: {
      type: String,
      enum: ['BCA'],
      required: false
    },
    amount: {
      type: Number,
      required: false
    },
    date_paid: {
      type: Date,
      required: false
    },
    mode: {
      type: String,
      enum: ['ONLINE', 'CASH'],
      required: false
    },
    transactionId: {
      type: String,
      required: false
    },
    desc: {
      type: String
    },
    balance: {
      type: Number
    },
    status:{
      type: String,
      required: false
    }
  },
  { strict: false, timestamps: true }
);
const FeesModel = mongoose.model("fees", feesSchema);
module.exports = FeesModel;
