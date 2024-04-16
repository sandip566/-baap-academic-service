const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/bookIssueLog.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const Book = require("../schema/books.schema");
const bookIssueLogModel = require("../schema/bookIssueLog.schema");
const booksServices = require("../services/books.services");
const shelfModel = require("../schema/shelf.schema");

router.post(
    "/",
    checkSchema(require("../dto/bookIssueLog.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const bookIssueLogId = +Date.now();
        req.body.bookIssueLogId = bookIssueLogId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria(req.query);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.post("/issue-book", async (req, res) => {
    try {
        const { groupId, bookId, addmissionId, dueDate, issuedDate } = req.body;

        const existingReservation = await bookIssueLogModel.findOne({
            addmissionId: addmissionId,
            bookId: bookId,
            returned: false,
        });
        if (existingReservation) {
            return res.status(400).json({
                success: false,
                error: "There is already an unreturned reservation for this book and admission ID.",
            });
        }
        const isBookAvailable = await service.isBookAvailableForIssuing(bookId);
        if (isBookAvailable) {
            return res.status(400).json({
                success: false,
                error: "Overdue book returned needed",
            });
        }
        const book = await Book.findOne({ bookId: bookId });
        if (!book || book.availableCount <= 0) {
            return res.status(400).json({
                success: false,
                error: "The book is not available for issuing. Available count is zero.",
            });
        }
        const shelfId = await booksServices.getShelfId(req.body.bookId);
        const shelf = await shelfModel.find({ shelfId });
        if (!shelf) {
            return res.status(404).json({ error: "Shelf not found" });
        }
        await shelfModel.findOneAndUpdate(
            { shelfId: shelfId, availableCapacity: { $gt: 0 } },
            { $inc: { availableCapacity: 1, currentInventory: -1 } },
            { new: true }
        );
        const bookIssueLogId = +Date.now();
        const newReservation = {
            groupId: groupId,
            bookId: bookId,
            bookIssueLogId: bookIssueLogId,
            addmissionId: addmissionId,
            dueDate: dueDate,
            issuedDate: issuedDate,
            shelfId: shelfId,
        };
        const createdReservation = await service.create(newReservation);
        await Book.findOneAndUpdate(
            { bookId: bookId, availableCount: { $gt: 0 } },
            { $inc: { availableCount: -1 } },
            { new: true }
        );
        res.status(201).json({
            success: true,
            reservation: createdReservation,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
});

router.post("/return-book", async (req, res) => {
    try {
        const { groupId, bookId, addmissionId, returnDate } = req.body;
        const existingReservation = await bookIssueLogModel.findOne({
            bookId: bookId,
            addmissionId: addmissionId,
            returned: false,
        });
        if (!existingReservation) {
            return res.status(400).json({
                success: false,
                error: "The book is not currently issued to the specified group.",
            });
        }
        const updatedReservation = await service.updateBookIssueLogById(
            existingReservation.bookIssueLogId,
            { returned: true, returnDate: new Date() }
        );
        await Book.findOneAndUpdate(
            { bookId: bookId, availableCount: { $gt: 0 } },
            { $inc: { availableCount: 1 } }
        );
        res.status(200).json({
            success: true,
            reservation: updatedReservation,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
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
        bookIssueLogId: req.params.bookIssueLogId,
        studentId: req.params.studentId,
        returned: req.params.returned,
    };
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.delete(
    "/groupId/:groupId/bookIssueLogId/:bookIssueLogId",
    async (req, res) => {
        try {
            const bookIssueLogId = req.params.bookIssueLogId;
            const groupId = req.params.groupId;
            const bookIssueLogData = await service.deleteBookIssueLogById({
                bookIssueLogId: bookIssueLogId,
                groupId: groupId,
            });
            if (!bookIssueLogData) {
                res.status(404).json({
                    error: "book data not found to delete",
                });
            } else {
                res.status(201).json(bookIssueLogData);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);
router.put(
    "/groupId/:groupId/bookIssueLogId/:bookIssueLogId",
    async (req, res) => {
        try {
            const bookIssueLogId = req.params.bookIssueLogId;
            const groupId = req.params.groupId;
            const newData = req.body;
            const updatebookIssueLog = await service.updateBookIssueLogById(
                bookIssueLogId,
                groupId,
                newData
            );
            if (!updatebookIssueLog) {
                res.status(404).json({
                    error: "bookIssueLog data not found to update",
                });
            } else {
                res.status(200).json({
                    updatebookIssueLog,
                    message: "data update successfully",
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.get("/book-issues/overdue", async (req, res) => {
    const bookIssues = await service.fetchBookIssuesWithOverdue();
    requestResponsehelper.sendResponse(res, bookIssues);
});

router.get("/student-details/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        search: req.query.search,
    };
    const searchFilter = await service.getStudentDetails(groupId, criteria);
    requestResponsehelper.sendResponse(res, searchFilter);
});
router.get("/getBooksdetails/:userId", async (req, res) => {
    const userId=parseInt(req.params.userId)
    const response = await service.getUserIssuedBooks(userId);
    requestResponsehelper.sendResponse(res, response);
});
module.exports = router;
