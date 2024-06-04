const mongoose = require("mongoose");

const DocumentCategorySchema = new mongoose.Schema(
    {
        documenCategoryId:{
            type:Number
        },
        groupId:{
            type:Number
        }

    },
    { timestamps: true }
);

const DocumentCategoryModel = mongoose.model("documentcategory", DocumentCategorySchema);
module.exports = DocumentCategoryModel;
