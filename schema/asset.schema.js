const mongoose = require("mongoose");

const AssetSchema = new mongoose.Schema(
  {
    groupId: {
      type: Number,
      required: false
    },
    assetId: {
      type: Number,
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
      required: false
    },
    depreciationMethod: {
      type: String,
      required: false
    },
    depreciationStartDate: {
      type: Date,
      required: false
    },
    location: {
      type: String,
      required: false
    },
    currentValue: {
      type: Number,
      required: false
    },
    status: {
      type: String,
      required: false
    },
    available: {
      type: Number,
      required: false
    },
    serialNo: {
      type: Number,
      required: false
    },
    modelName: {
      type: String,
      required: false
    }
  },
  { strict: false, timestamps: true }
);

const AssetModel = mongoose.model("asset", AssetSchema);
module.exports = AssetModel;
