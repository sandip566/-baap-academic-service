const mongoose = require("mongoose");

const CategoriesSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1,
            required: true
        },
        categoriesId: {
            type: Number
        },
        name: {
            type: String
        }
    },
    { strict: false, timestamps: true }
);
const CategoriesModel = mongoose.model("categories", CategoriesSchema);
module.exports = CategoriesModel;
