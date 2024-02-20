const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/books.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const booksModel = require("../schema/books.schema");
const shelfModel=require('../schema/shelf.schema');
const deparmentModel=require("../schema/department.schema")

router.post(
    "/",
    checkSchema(require("../dto/books.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const bookId = +Date.now();
        req.body.bookId = bookId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all", async (req, res) => {
    const pagination = {
        pageNumber: req.query.pageNumber || 1,
        pageSize: 10,
    };
    const { pageNumber, pageSize, ...query } = req.query;
    const serviceResponse = await service.getAllByCriteria(query, pagination);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/:id", async (req, res) => {
    const serviceResponse = await service.deleteById(req.params.id);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.put("/:id", async (req, res) => {
    const serviceResponse = await service.updateById(req.params.id, req.body);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

// router.get("/:id", async (req, res) => {
//     const serviceResponse = await service.getById(req.params.id);
//     requestResponsehelper.sendResponse(res, serviceResponse);
// });

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const criteria = {
            name: req.query.name,
            author: req.query.author,
            totalCount: req.query.totalCount,
            search: req.query.search,
            shelfId: req.query.shelfId,
            department: req.query.department,
            publisher: req.query.publisher,
            price: req.query.price,
            status: req.query.status
        };

        const searchFilter = service.getAllDataByGroupId(groupId, criteria);

        // Use the search filter to fetch data from the database
        const books = await booksModel.find(searchFilter);

        // Manually populate shelf and department information
        const populatedBooks = await Promise.all(books.map(async (book) => {
            const shelf = await shelfModel.findOne({ shelfId: book.shelfId });
            const department = await deparmentModel.findOne({ departmentId: book.departmentId });
            return { ...book._doc, shelf, department };
        }));
        // Return all data related to the matched documents
        res.json(populatedBooks);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.delete("/groupId/:groupId/bookId/:bookId", async (req, res) => {
    try {
        const bookId = req.params.bookId;
        const groupId = req.params.groupId;
        const bookData = await service.deleteBookById({
            bookId: bookId,
            groupId: groupId,
        });
        if (!bookData) {
            res.status(404).json({
                error: "book data not found to delete",
            });
        } else {
            res.status(201).json(bookData);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.put("/groupId/:groupId/bookId/:bookId", async (req, res) => {
    try {
        const bookId = req.params.bookId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const updatebook = await service.updateBookById(
            bookId,
            groupId,
            newData
        );
        if (!updatebook) {
            res.status(404).json({
                error: "book data not found to update",
            });
        } else {
            res.status(200).json({
                updatebook,
                message: "data update successfully",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/totalAvailableBooks", async (req, res) => {
    try {
        const totalCount = await service.getTotalAvailableBooks();
        res.json({ totalAvailableBooks: totalCount });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/totalBooks", async (req, res) => {
    try {
        const books = await booksModel.find({});
        let totalCount = 0;
        for (const book of books) {
            totalCount += book.totalCopies;
        }
        res.json({ totalAvailableBooks: totalCount });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
