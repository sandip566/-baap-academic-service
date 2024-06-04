const mongoose = require("mongoose");

const DocumentCategorySchema = new mongoose.Schema(
    {
        documenCategoryId:{
            type:Number,
            required:true,
        },
        groupId:{
            type:Number,
            required:true,
        }

    },
    {strict:false, timestamps: true }
);

const DocumentCategoryModel = mongoose.model("documentcategory", DocumentCategorySchema);
module.exports = DocumentCategoryModel;
