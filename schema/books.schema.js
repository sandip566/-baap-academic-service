const mongoose = require("mongoose");
const booksSchema = new mongoose.Schema(
    {
        bookId: Number,
        name: {
            type: String,
            required: false,
        },
        purchaseId: {
            type: Number,
            required: true,
        },
        groupId: {
            type: Number,
            required: false,
        },
        bookIssueLogId: {
            type: Number,
        },
        author: {
            type: String,
            required: true,
        },
        genre: {
            type: Number,
            require: false,
        },
        ISBN: {
            type: Number,
            require: false,
        },
        totalCopies: {
            type: Number,
        },
        availableCount: {
            type: Number,
        },
        RFID: {
            type: String,
            required: false,
        },
        shelfId: {
            type: Number,
            required: false,
        },
        price: {
            type: Number,
        },
        publisherId: {
            type: Number,
            required: false,
        },
        departmentId: {
            type: Number,
            require: false,
        },
        status: {
            type: String,
            // enum: ["Available", "Lost", "Loaned", "Reserved", "NotAvailable"],
            default:"available"
        },
    },
    { strict: false, timestamps: true }
);
booksSchema.plugin(require("mongoose-autopopulate"));
const booksModel = mongoose.model("book", booksSchema);
module.exports = booksModel;
