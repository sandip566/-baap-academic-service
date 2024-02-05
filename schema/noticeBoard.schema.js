const mongoose = require('mongoose');
const moment = require("moment");

const noticeBoardSchema = new mongoose.Schema(
    {
        noticeBoardId: {
            type: Number,
        },
        groupId: {
            type: Number,
            require: false,
        },
        title: {
            type: String
        },
        content: {
            type: String,
            required: false
        },
        noticePostDate: {
            type: Date,
            default: Date.now()
        },
        noticeExpiryDate: {
            type: String
        },
        isActive: {
            type: Boolean,
            default: false
        },
     createNotice:{
        type:String
     }
    },
    { strict: false, timestamps: true }
);
noticeBoardSchema.pre('save', function (next) {
    const today = moment().startOf('day');
    const expiryDate = moment(this.noticeExpiryDate).startOf('day');
    // Check if the current date is the same as the expiration_date or if it's in the future
    this.isActive = today.isSameOrBefore(expiryDate);
    next();
});
noticeBoardSchema.plugin(require("mongoose-autopopulate"));
const noticeBoardModel = mongoose.model("noticeBoard", noticeBoardSchema);
module.exports = noticeBoardModel;
