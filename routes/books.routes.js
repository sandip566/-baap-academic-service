const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/books.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const shelfModel = require("../schema/shelf.schema");
const PurchaseModel = require("../schema/purchase.schema");
router.post(
    "/",
    checkSchema(require("../dto/books.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        try {
            let purchaseData = await PurchaseModel.findOne({
                groupId: req.body.groupId,
                purchaseId: req.body.purchaseId,
            });
            if (!purchaseData) {
                return res.status(400).json({
                    success: false,
                    error: "This book has not been purchased",
                });
            }
            if (req.body.totalCopies !== undefined) {
                req.body.availableCount = req.body.totalCopies;
            }
            const shelfId = req.body.shelfId;
            const shelf = await shelfModel.findOne({ shelfId });

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
        } catch (error) {
            console.error("Error in creating book:", error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error",
            });
        }
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
    const groupId = req.params.groupId;
    const criteria = {
        name: req.query.name,
        totalCount: req.query.totalCount,
        availableCount: req.query.availableCount,
        search: req.query.search,
        shelfId: req.query.shelfId,
        shelfName: req.query.shelfName,
        ISBN: req.query.search
    };
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria,
        page,
        limit
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/groupId/:groupId/bookId/:bookId", async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const bookId = req.params.bookId;
        const data = await service.deleteBookById(groupId, bookId);
        if (data === false) {
            res.status(400).json({
                error: "book is issued it cannot be deleted.",
            });
        } else if (!data) {
            res.status(404).json({ error: "Book not found." });
        } else {
            res.status(200).json(data);
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
