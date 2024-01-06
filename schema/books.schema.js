const mongoose = require('mongoose');

const booksSchema = new mongoose.Schema(
    {
        bookId: Number,
        title: {
            type: String,
            required: true,
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
            require: true
        },
        ISBN: {
            type: Number,
            require: true
        },
        availableCount: {
            type: Number,
        },
        // availableCopies: {
        //     type: Number,
        //     require: true
        // },
        totalCopies: {
            type: Number,
            require: true
        },
        RFID: {
            type: String,
            required: true
        },
        shelfId: {
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: true,
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
