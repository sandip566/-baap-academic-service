const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/books.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const booksModel = require("../schema/books.schema");
const shelfModel = require("../schema/shelf.schema");
const deparmentModel = require("../schema/department.schema");
const publisherModel = require("../schema/publisher.schema");
const bookIssueLogService = require("../services/bookIssueLog.service");
router.post(
    "/",
    checkSchema(require("../dto/books.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        if (req.body.totalCopies !== undefined) {
            req.body.availableCount = req.body.totalCopies;
        }
        const shelfId = req.body.shelfId; // Assuming the shelfId is provided in the request body
        const shelf = await shelfModel.find({ shelfId });
        if (!shelf) {
            return res.status(404).json({ error: "Shelf not found" });
        }
        if (shelf.availableCapacity <= 0) {
            return res.status(400).json({
                error: "This shelf is not available for storing books. Available capacity is zero.",
            });
        }
        await shelfModel.findOneAndUpdate(
            { shelfId: shelfId, availableCapacity: { $gt: 0 } },
            { $inc: { availableCapacity: -1, currentInventory: 1 } },
            { new: true }
        );
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

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const criteria = {
            name: req.query.name,
            author: req.query.author,
            totalCount: req.query.totalCount,
            availableCount: req.query.availableCount,
            search: req.query.search,
            shelfId: req.query.shelfId,
            departmentId: req.query.departmentId,
            publisherId: req.query.publisherId,
            price: req.query.price,
            status: req.query.status,
            shelfName: req.query.shelfName,
            departmentName: req.query.departmentName,
            publisherName: req.query.publisherName,
        };

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;
        const departmentMap = await service.getDepartmentMap(groupId);
        const shelfMap = await service.getShelfMap();
        const publisherMap = await service.getPublisherMap();

        const { searchFilter } = await service.getAllDataByGroupId(
            groupId,
            criteria,
            skip,
            limit,
            departmentMap,
            shelfMap,
            publisherMap
        );
        const totalCount = await booksModel.countDocuments(searchFilter);
        const books = await booksModel
            .find(searchFilter)
            .skip(skip)
            .limit(limit)
            .exec();

        const populatedBooks = await Promise.all(
            books.map(async (book) => {
                const shelf = await shelfModel.findOne({
                    shelfId: book.shelfId,
                });
                const department = await deparmentModel.findOne({
                    departmentId: book.departmentId,
                });
                const publisher = await publisherModel.findOne({
                    publisherId: book.publisherId,
                });
                return { ...book._doc, shelf, department, publisher };
            })
        );
        const count = await service.getBooksCount(req.body.groupId);
        res.json({
            status: "Success",
            data: {
                items: populatedBooks,
                totalCount: totalCount,
                booksCount: count,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
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

router.get("/book-details/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        search: req.query.search,
    };
    const searchFilter = await service.getBookDetails(groupId, criteria);
    requestResponsehelper.sendResponse(res, searchFilter);
});

module.exports = router;
