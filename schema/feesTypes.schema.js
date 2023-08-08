const mongoose = require('mongoose');

const feesTypesSchema = new mongoose.Schema({
  groupId: { type: Number, required: true },
  feesType: { type: String, required: true },
  tax: { type: Number, required: true },
  total_fees: { type: Number, required: true },
  gross_fees: { type: Number, required: true },
  installments: { type: Array, required: true },
  desc: { type: String }
});

const FeesTypesModel = mongoose.model("feesTypes", feesTypesSchema);
module.exports = FeesTypesModel;