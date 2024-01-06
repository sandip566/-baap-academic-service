const mongoose = require("mongoose");

const shelf = new mongoose.Schema(
  {
    shelfId: Number,
    locationIdentifier: {
      type: String,
      required: true
    },
    groupId: {
      type: Number,
      default: 1
    }
  },
  { strict: false, timestamps: true }
);
const productModel = mongoose.model("shelf", shelf);
module.exports = productModel;
