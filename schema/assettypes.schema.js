const mongoose = require("mongoose");

const AssetTypesSchema = new mongoose.Schema(
  {
    groupId: {
      type: Number,
      required: false
    },
    assetTypeId: {
      type: Number,
      required: false
    },
    name: {
      type: String,
      required: true,
    }
  }, { strict: false, timestamps: true }
);

const AssetTypesModel = mongoose.model("assettypes", AssetTypesSchema);
module.exports = AssetTypesModel;
