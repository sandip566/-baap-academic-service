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
        const { groupId, bookId, dueDate, userId,name,url,issuedDate } =   req.body;
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
        const newReservation = {
            groupId: groupId,
            bookId: bookId,
            bookIssueLogId: bookIssueLogId,
            dueDate: dueDate,
            issuedDate:new Date(),
            userId: userId,
            isReturn: false,
            name:name,
            url:url
        };
        const createdReservation = await service.create(newReservation);
        await Book.findOneAndUpdate(
            { bookId: bookId, availableCount: { $gt: 0 } }, 
            { $inc: { availableCount: -1 } },
            { new: true, runValidators: true }
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
        pageNumber:req.query.pageNumber,
        pageSize:req.query.pageSize
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
            name,
            url
        } = req.body;

        // Find student admission based on groupId and userId
        const studentAdmission = await StudentsAdmissionModel.findOne({
            groupId: groupId,
            userId: userId,
        });

        // Check if student admission data exists
        if (studentAdmission) {
            // Perform status checks only if studentAdmission exists
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
        }

        // If student admission data does not exist, continue to reserve the book
        const serviceResponse = await service.reserveBook(groupId, bookId);
        if (!serviceResponse || serviceResponse.length===0) {
            return res.status(400).json({
                success: false,
                error: "The book is not available for reserving",
            });
        }

        // Check if the book is already reserved by the user
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

        // Decrease availableCount of the book by totalCopies
        const bookUpdate = await Book.findOne(
            { bookId: bookId, totalCopies: { $gt: 0 } } 
        );

        if (!bookUpdate) {
            return res.status(400).json({
                success: false,
                error: "The book is not available or insufficient copies available.",
            });
        }

        // Update book status if no available copies left
        if (bookUpdate.availableCount === 0) {
            await Book.findOneAndUpdate(
                { bookId: bookId },
                { status: "NotAvailable" }
            );
        }

        // Generate unique bookIssueLogId for the reservation
        const bookIssueLogId = +Date.now();

        // Create new reservation object
        const newReservation = {
            groupId: groupId,
            bookId: bookId,
            bookIssueLogId: bookIssueLogId,
            addmissionId: addmissionId,
            reserveDate: new Date(), // Assuming reserveDate is current date/time
            isReserve: true,
            totalCopies: totalCopies,
            userId: userId,
            status: "Reserved",
            name:name,
            url:url
        };
        console.log(newReservation)
        // Save the reservation to database using service
        const createdReservation = await service.create(newReservation);

        // Fetch configuration for reservation day limit
        const config = await ConfigurationModel.findOne({ groupId: groupId });
        const reservationDayLimit = config.LibraryReservationDayLimit; // Assuming value is in days

        // Schedule a task to remove reservation after reservationDayLimit days
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
                if (book.status === "NotAvailable" && book.availableCount === 0) {
                    await Book.findOneAndUpdate(
                        { groupId: groupId },
                        { bookId: bookId },
                        { status: "Available" }
                    );
                }
            }
        }, reservationDayLimit * 24 * 60 * 60 * 1000);

        // Respond with success and reservation details
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
