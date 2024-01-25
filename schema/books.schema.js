const mongoose = require('mongoose');

const booksSchema = new mongoose.Schema(
    {
        bookId: Number,
        title: {
            type: String,
            required: false,
        },
        groupId: {
            type: Number,
            default: 1
        },
        author: {
            type: String,
            required: true,
        },
        genre: {
            type: Number,
            require: false
        },
        ISBN: {
            type: Number,
            require: false
        },
        availableCount: {
            type: Number,
        },
        totalCopies: {
            type: Number,
            require: false
        },
        RFID: {
            type: String,
            required: false
        },
        shelfId: {
            type:Number,
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: false,
            ref: 'shelf'
        },
        status: {
            type: String,
            enum: ["Available", "Lost", "Loaned", "Reserved", "NotAvailable"]
        }
    },
    { strict: false, timestamps: true }
);
booksSchema.plugin(require("mongoose-autopopulate"));
const booksModel = mongoose.model("book", booksSchema);
module.exports = booksModel;
