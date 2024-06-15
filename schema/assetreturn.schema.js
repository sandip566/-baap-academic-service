const mongoose = require("mongoose");

const AssetReturnSchema = new mongoose.Schema(
  {
    groupId: {
      type: Number,
      required: false
    },
    returnAssetId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Return"
    }
  }, { strict: false, timestamps: true }
);

const AssetReturnModel = mongoose.model("assetreturn", AssetReturnSchema);
module.exports = AssetReturnModel;
