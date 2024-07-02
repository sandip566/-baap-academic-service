const mongoose = require("mongoose");

const AttachmentNameSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true,
        },
        attachmentId:{
            type:Number
        },
        name:{
            type:String
        }
    },
    { timestamps: true ,statics:false}
);

const AttachmentNameModel = mongoose.model("attachmentname", AttachmentNameSchema);
module.exports = AttachmentNameModel;
