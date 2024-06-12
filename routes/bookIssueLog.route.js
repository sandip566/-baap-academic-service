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
const StudentsAdmissionModel = require("../schema/studentAdmission.schema");
const ConfigurationModel = require("../schema/configuration.schema");

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
        const { groupId, bookId, issuedDate, dueDate, userId,name,url } =   req.body;
        const bookStatus=await service.checkBook(groupId,bookId)
        if (!bookStatus || bookStatus.length===0) {
            return res.status(400).json({
                success: false,
                error: "This book is not available in library",
            });
        }
        
        const isOverdue = await service.checkOverdueStatus(groupId, userId);
        if (isOverdue) {
            return res.status(400).json({
                success: false,
                error: "You have previous overdue book",
            });
        }
        const existingReservation = await service.checkReservation(groupId,userId,bookId);
        if (existingReservation) {
            return res.status(400).json({
                success: false,
                error: "There is already an unreturned reservation for this book and user ID.",
            });
        }
        const isAvailable = await service.checkBookAvailability(
            groupId,
            bookId
        );
        if (isAvailable <= 0) {
            return res.status(400).json({
                success: false,
                error: "The book is not available for issuing. Available count is zero.",
            });
        }
        const bookIssueLogId = Date.now();
            groupId: groupId,
            bookId: bookId,
            bookIssueLogId: bookIssueLogId,
            dueDate: dueDate,
            issuedDate: issuedDate,
            userId: userId,
            isReturn: false,
            name:name,
            url:url
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

router.get(
    "/groupId/:groupId/bookIssueLogId/:bookIssueLogId",
    async (req, res) => {
        const serviceResponse = await service.getBybookIssueLogId(
            req.params.groupId,
            req.params.bookIssueLogId
        );
        const serviceResponse = await service.getBybookIssueLogId(
            req.params.groupId,
            req.params.bookIssueLogId
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
router.post("/return-book", async (req, res) => {
    try {
        const { groupId, bookId, userId, returnDate } = req.body;

        const updatedReservation = await service.returnBook(groupId, bookId, userId, returnDate);

        res.status(200).json({
            success: true,
            reservation: updatedReservation,
        });
    } catch (error) {
        console.error(error);
        if (error.message === "returnDate is required" || error.message === "Invalid return date") {
            return res.status(400).json({
                success: false,
                error: error.message,
            });
        }

        if (error.message === "The book is not currently issued to the specified group." ||
            error.message === "First Paid Payment, Your Log is OverDue") {
            return res.status(409).json({
                success: false,
                error: error.message,
            });
        }

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
        bookIssueLogId: req.query.bookIssueLogId,
        status: req.query.status,
        search: req.query.search,
        userId: req.query.userId,
        isOverdue: req.query.isOverdue,
        isReserve: req.query.isReserve,
        isReturn: req.query.isReturn,
        studentName: req.query.studentName,
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
                groupId,
                bookIssueLogId,

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

router.get("/book-issues/overdue/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const { userId, bookIssueLogId } = req.query;
    const bookIssues = await service.fetchBookIssuesWithOverdue(
        groupId,
        userId,
        bookIssueLogId
    );
    requestResponsehelper.sendResponse(res, bookIssues);
});

router.get("/student-details/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.limit);
    const criteria = {
        search: req.query.search,
    };
    const searchFilter = await service.getStudentDetails(
        groupId,
        criteria,
        page,
        perPage
    );
    requestResponsehelper.sendResponse(res, searchFilter);
});
router.get("/getBooksdetails/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const response = await service.getUserIssuedBooks(userId);
    requestResponsehelper.sendResponse(res, response);
});

router.post("/reserve-book", async (req, res) => {
    try {
        const {
            groupId,
            bookId,
            addmissionId,
            reserveDate,
            userId,
            totalCopies,
            ISBN,
            bookName,
        } = req.body;
 
        const studentAdmission = await StudentsAdmissionModel.findOne({
            groupId: groupId,
            userId: userId,
        });
 
        if (!studentAdmission) {
            return res.status(400).json({
                success: false,
                error: "Admission ID not found.",
            });
        }
 
        if (studentAdmission.admissionStatus === "Cancel") {
            return res.status(400).json({
                success: false,
                error: "The admission ID has been canceled.",
            });
        }
 
        if (studentAdmission.admissionStatus === "Draft") {
            return res.status(400).json({
                success: false,
                error: "The admission ID has a status of 'Draft'.",
            });
        }
 
        if (studentAdmission.admissionStatus !== "Confirm") {
            return res.status(400).json({
                success: false,
                error: "The admission ID does not have a confirmed status.",
            });
        }
 
        const serviceResponse = await service.reserveBook(groupId, bookId);
        console.log(serviceResponse);
        if (!serviceResponse) {
            return res.status(400).json({
                success: false,
                error: "The book is not available for reserving",
            });
        }
 
        const existingReservation = await bookIssueLogModel.findOne({
            bookId: bookId,
            userId: userId,
            status: "Reserved",
        });
        if (existingReservation) {
            return res.status(400).json({
                success: false,
                error: "You have already reserved this book",
            });
        }
 
        const bookUpdate = await Book.findOneAndUpdate(
            { bookId: bookId, availableCount: { $gt: 0 } },
            { $inc: { availableCount: -totalCopies } },
            { new: true }
        );
 
        if (!bookUpdate) {
            return res.status(400).json({
                success: false,
                error: "The book is not available or insufficient copies available.",
            });
        }
 
        if (bookUpdate.availableCount == 0) {
            await Book.findOneAndUpdate(
                { bookId: bookId },
                { status: "NotAvailable" }
            );
        }
 
        const bookIssueLogId = +Date.now();
        const newReservation = {
            groupId: groupId,
            bookId: bookId,
            bookIssueLogId: bookIssueLogId,
            addmissionId: addmissionId,
            reserveDate: new Date(),
            isReserve: true,
            totalCopies: totalCopies,
            ISBN: ISBN,
            bookName: bookName,
            userId: userId,
            status: "Reserved",
        };
        const createdReservation = await service.create(newReservation);
        const config = await ConfigurationModel.findOne({ groupId: groupId });
        const reservationDayLimit = config.LibraryReservationDayLimit; // Assuming value is in days
        console.log(reservationDayLimit);
        // // Schedule a task to remove reservation after 3 days
        setTimeout(async () => {
            const removedReservation = await bookIssueLogModel.findOneAndUpdate(
                {
                    bookId: bookId,
                    bookIssueLogId: bookIssueLogId,
                    userId: userId,
                    status: "Reserved",
                    isReserve: true,
                },
                { $unset: { status: "", isReserve: true } }
            );
            if (removedReservation) {
                const book = await Book.findOne({ bookId: bookId });
                await Book.findOneAndUpdate(
                    { groupId: groupId },
                    { bookId: bookId },
                    { $inc: { availableCount: removedReservation.totalCopies } }
                );
                if (
                    book.status === "notAvailable" &&
                    book.availableCount === 0
                ) {
                    await Book.findOneAndUpdate(
                        { groupId: groupId },
                        { bookId: bookId },
                        { status: "available" }
                    );
                }
            }
 
            console.log("removedReservation", removedReservation);
        }, reservationDayLimit * 24 * 60 * 60 * 1000);
 
        res.status(201).json({
            success: true,
            reservation: createdReservation,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
