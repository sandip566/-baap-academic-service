const mongoose = require("mongoose");
const shelf = new mongoose.Schema(
  {
    shelfId: Number,
    locationIdentifier: {
      type: String,
      required: false
    },
    shelfName:{
      type:String
    },
    groupId: {
      type: Number,
      required: false
    }
  },
  { strict: false, timestamps: true }
);
const productModel = mongoose.model("shelf", shelf);
module.exports = productModel;
