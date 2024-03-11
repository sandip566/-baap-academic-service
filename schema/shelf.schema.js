const mongoose = require("mongoose");
const shelf = new mongoose.Schema(
  {
    shelfId: Number,
    groupId: {
      type: Number,
      required: false
    },
    location: {
      type: String,
      required: false
    },
    shelfName: {
      type: String
    },
    capacity: {
      type: Number,
      required: false
    },
    currentInventory: {
      type: Number,
      required: false
    },
    shelfType: {
      type: String,
      enum: ["regular", "reference", "periodicals"],
      default: "regular"
    },
    description: {
      type: String,
      required: false
    },
    availableCapacity: {
      type: Number
    }
  },
  { strict: false, timestamps: true }
);
const productModel = mongoose.model("shelf", shelf);
module.exports = productModel;
