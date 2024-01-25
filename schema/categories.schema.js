const mongoose = require("mongoose");
const CategoriesSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: false
        },
        categoriesId: {
            type: Number,
            required: false
        },
        name: {
            type: String,
            required: false
        }
    },
    { strict: false, timestamps: true }
);
const CategoriesModel = mongoose.model("categories", CategoriesSchema);
module.exports = CategoriesModel;
