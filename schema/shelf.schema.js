const mongoose = require("mongoose");

const shelf = new mongoose.Schema(
  {
    shelfId: Number,
    locationIdentifier: {
      type: String,
      required: false
    },
    groupId: {
      type: Number,
      required : false
    }
  },
  { strict: false, timestamps: true }
);
const productModel = mongoose.model("shelf", shelf);
module.exports = productModel;
