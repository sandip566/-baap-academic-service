const mongoose = require('mongoose');

const feesSchema = new mongoose.Schema({
  groupId: { type: Number, required: true },
  memberId: { type: String, required: true },
  userId: { type: String, required: true },
  feesType: { type: String, enum: ['BCA'], required: true },
  amount: { type: Number, required: true },
  date_paid: { type: Date, required: true },
  mode: { type: String, enum: ['ONLINE', 'CASH'], required: true },
  transactionId: { type: String, required: true },
  desc: { type: String },
  balance: { type: Number }
});

const FeesModel = mongoose.model("fees", feesSchema);
module.exports = FeesModel;