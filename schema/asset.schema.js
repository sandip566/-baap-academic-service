const mongoose = require("mongoose");

const AssetSchema = new mongoose.Schema(
  {
    groupId: {
      type: Number,
      required: false
    },
    assetId: {
      type: String,
      required: true,
    },
    assetName: {
      type: String,
      required: false
    },
    assetType: {
      type: String,
      required: false
    },
    purchaseDate: {
      type: String,
      required: false
    },
    purchaseCost: {
      type: Number,
      required: true
    },
    depreciationMethod: {
      type: String,
      required: true
    },
    depreciationStartDate: {
      type: Date,
      required: false
    },
    location: {
      type: String,
      required: true
    },
    currentValue: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      required: true
    },
    available: {
      type: Number,
      required: false
    }

  },
  { timestamps: true }
);

const AssetModel = mongoose.model("asset", AssetSchema);
module.exports = AssetModel;
