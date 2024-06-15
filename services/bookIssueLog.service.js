const bookIssueLogModel = require("../schema/bookIssueLog.schema.js");
const BaseService = require("@baapcompany/core-api/services/base.service");
const Book = require("../schema/books.schema.js");
const studentAdmissionModel = require("../schema/studentAdmission.schema.js");
const { addListener } = require("../schema/publisher.schema.js");
const studentAdmissionServices = require("./studentAdmission.services.js");
const StudentsAdmissionModel = require("../schema/studentAdmission.schema.js");
const configurationModel = require("../schema/configuration.schema.js");
class BookIssueLogService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getAllDataByGroupId(groupID, criteria) {
        try {
            const groupId = parseInt(groupID);
            const searchFilter = { groupId };
            const aggregationPipeline = [
                {
                    $match: searchFilter
                },
                {
                    $lookup: {
                        from: "books",
                        localField: "bookId",
                        foreignField: "bookId",
                        as: "books"
                    }
                },
                {
                    $unwind: {
                        path: "$books",
                        preserveNullAndEmptyArrays: true
                    }
                }
            ];
            if (criteria.search) {
                const searchRegex = new RegExp(criteria.search.trim(), "i");
                aggregationPipeline.push({
                    $match: {
                        $or: [
                            { "books.name": searchRegex },
                            { "books.ISBN": { $eq: parseInt(criteria.search) } },
                            { userId: { $eq: parseInt(criteria.search) } },
                            { name: searchRegex }
                        ]
                    }
                });
            }

            if (criteria.isReturn !== undefined) {
                aggregationPipeline.push({ $match: { isReturn: criteria.isReturn === 'true' } });
            }
            if (criteria.isReserve !== undefined) {
                aggregationPipeline.push({ $match: { isReserve: criteria.isReserve === 'true' } });
            }
            if (criteria.status) {
                aggregationPipeline.push({ $match: { status: criteria.status } });
            }
            if (criteria.isOverdue !== undefined) {
                aggregationPipeline.push({ $match: { isOverdue: criteria.isOverdue === 'true' } });
            }
            if (criteria.userId) {
                aggregationPipeline.push({ $match: { userId: parseInt(criteria.userId) } });
            }
            aggregationPipeline.push({
                $sort: { _id: -1 }
            });
            const pageNumber = parseInt(criteria.pageNumber) || 1;
            const pageSize = parseInt(criteria.pageSize) || 10;
            aggregationPipeline.push(
                { $skip: (pageNumber - 1) * pageSize },
                { $limit: pageSize }
            );
            const populatedBookIssueLog = await bookIssueLogModel.aggregate(aggregationPipeline);
            const totalCount = await bookIssueLogModel.countDocuments(searchFilter);
            const count = await this.getCount(groupId);
            const Count = await bookIssueLogModel.countDocuments(
                searchFilter
            );

            return {
                status: "Success",
                populatedBookIssueLog,
                count: count,
                totalCount
            };
        } catch (error) {
            console.error("Error in getAllDataByGroupId:", error);
            throw new Error("An error occurred while processing the request. Please try again later.");
        }
    }

    async deleteBookIssueLogById(bookIssueLogId, groupId) {
        try {
            return await bookIssueLogModel.deleteOne(bookIssueLogId, groupId);
        } catch (error) {
            throw error;
        }
    }
    async getBybookIssueLogId(groupId, bookIssueLogId) {
        return this.execute(() => {
            return bookIssueLogModel.findOne({
                groupId: groupId,
                bookIssueLogId: bookIssueLogId,
            });
        });
    }
    async updateBookIssueLogById(groupId, bookIssueLogId, newData) {
        try {
            console.log("query2", {
                groupId: groupId,
                bookIssueLogId: bookIssueLogId,
            });
            const updateBookIssueLog = await bookIssueLogModel.findOneAndUpdate(
                { groupId: groupId, bookIssueLogId: Number(bookIssueLogId) },
                { $set: newData },
                { new: true }
            );
            return updateBookIssueLog;
        } catch (error) {
            throw error;
        }
    }

    async checkOverdueStatus(groupId, userId) {
        try {
            const existingReservation = await bookIssueLogModel.findOne({
                groupId: groupId,
                userId: userId,
                isOverdue: true,
            });
            return existingReservation;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async checkIssuedCount(groupId, addmissionId) {
        try {
            const count = await bookIssueLogModel.countDocuments({
                groupId: groupId,
                addmissionId: addmissionId,
                isReturn: false,
            });
            console.log(count + "count");
            if (count >= 3) {
                return false;
            } else {
                return true;
            }
        } catch (error) {
            throw error;
        }
    }

    async fetchBookIssuesWithOverdue(groupId, userId, bookIssueLogId) {
        try {
            const currDate = new Date();
            const finePerDay = 5;
            let query = {
                groupId: Number(groupId),
                isReturn: false,
            };

            if (userId) {
                query.userId = Number(userId);
            }

            if (bookIssueLogId) {
                query.bookIssueLogId = Number(bookIssueLogId);
            }

            const bookIssues = await bookIssueLogModel.find(query);
            const bookIds = bookIssues.map((issue) => issue.bookId);
            const books = await Book.find({ bookId: { $in: bookIds } });

            await Promise.all(
                bookIssues.map(async (bookIssue) => {
                    const dueDate = new Date(bookIssue.dueDate);
                    const diffTime = currDate - dueDate;
                    const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24)
                    );

                    if (diffDays >= 0) {
                        const totalFine = diffDays * finePerDay;
                        await bookIssueLogModel.updateOne(
                            { _id: bookIssue._id },
                            { $set: { isOverdue: true, totalFine: totalFine } }
                        );
                    }
                })
            );

            const bookIssuesWithOverdue = bookIssues
                .filter((bookIssue) => {
                    const dueDate = new Date(bookIssue.dueDate);
                    const diffTime = currDate - dueDate;
                    const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24)
                    );
                    return diffDays >= 0;
                })
                .map((bookIssue) => {
                    const dueDate = new Date(bookIssue.dueDate);
                    const diffTime = currDate - dueDate;
                    const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24)
                    );
                    const book = books.find(
                        (book) => book.bookId === bookIssue.bookId
                    );
                    const totalFine = diffDays * finePerDay;
                    let response = {
                        _id: bookIssue._id,
                        bookId: bookIssue.bookId,
                        book: {
                            _id: book._id,
                            bookId: book.bookId,
                            name: book.name,
                            purchaseId: book.purchaseId,
                            groupId: book.groupId,
                            author: book.author,
                            ISBN: book.ISBN,
                            totalCopies: book.totalCopies,
                            availableCount: book.availableCount,
                            shelfId: book.shelfId,
                            status: book.status,
                            vendorId: book.vendorId,
                            rackName: book.rackName,
                            rackNumber: book.rackNumber,
                            book_img: book.book_img,
                            createdAt: book.createdAt,
                            updatedAt: book.updatedAt,
                            __v: book.__v,
                        },
                        bookIssueLogId: bookIssue.bookIssueLogId,
                        bookIssueDate: bookIssue.issuedDate,
                        userId: bookIssue.userId,
                        bookName: book ? book.name : "Unknown Book",
                        ISBN: book ? book.ISBN : 0,
                        daysOverdue: diffDays,
                        totalFine: totalFine,
                        name:bookIssue.name,
                        profile_url:bookIssue.url
                    };
                    return response;
                });
            return {
                data: bookIssuesWithOverdue,
            };
        } catch (error) {
            throw error;
        }
    }

    async getIssueBooks(userId) {
        try {
            console.log(userId);
            const bookIssues = await bookIssueLogModel.countDocuments({
                isReturn: false,
                userId: userId,
            });
            const returnedBooks = await bookIssueLogModel.countDocuments({
                isReturn: true,
                userId: userId,
            });
            const totalBooksIssued = await bookIssueLogModel.countDocuments({
                userId: userId,
            });
            return {
                totalIssuedBooks: totalBooksIssued,
                issuedBooks: bookIssues,
                returnedBooks: returnedBooks,
            };
        } catch (error) {
            console.log(error);
        }
    }
    async getCount(groupId) {
        try {
            const bookIssues = await bookIssueLogModel.countDocuments({
                groupId: groupId,
                isReturn: false,
            });
            const returnedBooks = await bookIssueLogModel.countDocuments({
                groupId: groupId,
                isReturn: true,
            });
            const reserveBooks = await bookIssueLogModel.countDocuments({
                groupId: groupId,
                status: "Reserved",
            });
            const response = {
                bookIssues: bookIssues,
                returnedBooks: returnedBooks,
                reserveBooks: reserveBooks,
            };
            return response;
        } catch (error) {
            console.log(error);
        }
    }
    async getStudentDetails(groupId, criteria, page, perPage) {
        try {
            const response = await studentAdmissionServices.getAllDataByGroupId(
                groupId,
                criteria,
                page,
                perPage
            );
            const students = response.data.items;
            const student = await bookIssueLogModel.find({
                addmissionId: {
                    $in: students.map((book) => book.addmissionId),
                },
                isReturn: false,
            });
            const bookIds = student.map((student) => student.bookId);
            const booksObject = await Book.find({ bookId: { $in: bookIds } });
            const issuedBooks = student.map((item) => {
                const correspondingBook = booksObject.find(
                    (book) => book.bookId === item.bookId
                );

                return {
                    bookIssueLogId: item.bookIssueLogId,
                    bookIssueDate: item.issuedDate,
                    dueDate: item.dueDate,
                    bookName: correspondingBook ? correspondingBook.name : null,
                    availableCount: correspondingBook
                        ? correspondingBook.availableCount
                        : null,
                    totalCopies: correspondingBook
                        ? correspondingBook.totalCopies
                        : null,
                    book_img: correspondingBook
                        ? correspondingBook.book_img
                        : null,
                    overdue: item.isOverdue,
                };
            });
            return {
                data: "student",
                searchedStudents: students,
                issueLogs: issuedBooks,
            };
        } catch (error) {
            console.error("Error fetching student details:", error);
            return { error: "Internal server error" };
        }
    }

    async getUserIssuedBooks(userId) {
        try {
            const issuedBooks = await bookIssueLogModel.find({
                userId: userId,
                isReturn: false,
            });
            console.log(issuedBooks);
            const bookIds = issuedBooks.map((bookIssue) => bookIssue.bookId);
            const bookDetailsArray = await Promise.all(
                bookIds.map(async (bookId) => {
                    const bookDetails = await Book.findOne({ bookId: bookId });
                    return bookDetails;
                })
            );

            const validBookDetailsArray = bookDetailsArray.filter(
                (book) => book !== null
            );

            return { userIssuedBooks: validBookDetailsArray };
        } catch (error) {
            console.error("Error retrieving user's issued books:", error);
            return [];
        }
    }
    async reserveBook(groupID, bookID) {
        try {
            const groupId = parseInt(groupID);
            const bookId = parseInt(bookID);
            const book = await Book.aggregate([
                {
                    $match: {
                        groupId: groupId,
                        bookId: bookId
                    }
                },
            ])
            
            return book;
        } catch (error) {
            throw error;
        }
    }
    
    async checkBookAvailability(groupId, bookId) {
        try {
            const book = await Book.findOne({
                groupId: Number(groupId),
                bookId: Number(bookId),
            });
            const availableCount = book.availableCount;
            return availableCount;
        } catch (error) {
            throw error;
        }
    }

    async checkReservation(groupId, userId, bookId) {
        try {
            const existingReservation = await bookIssueLogModel.findOne({
                groupId: groupId,
                userId: userId,
                bookId: bookId,
                isReturn: false,
            });
            return existingReservation;
        } catch (error) {
            throw error;
        }
    }

    async checkBook(groupId, bookId) {
        try {
            const groupIdInt = parseInt(groupId);
            const bookIdInt = parseInt(bookId);

            const book = await Book.aggregate([
                {
                    $match: {
                        groupId: groupIdInt,
                        bookId: bookIdInt
                    }
                }
            ]);

            return book;
        } catch (error) {
            throw error;
        }
    }


    async returnBook(groupId, bookId, userId, returnDate) {
        if (!returnDate) {
            throw new Error("returnDate is required");
        }

        const parsedReturnDate = new Date(returnDate);
        if (isNaN(parsedReturnDate)) {
            throw new Error("Invalid return date");
        }

        const existingReservation = await bookIssueLogModel.findOne({
            groupId,
            bookId,
            userId,
            isReturn: false,
        });

        if (!existingReservation) {
            throw new Error("The book is not currently issued to the specified group.");
        }

        if (existingReservation.isOverdue === true) {
            throw new Error("First Paid Payment, Your Log is OverDue");
        }

        const updatedReservation = await this.updateBookIssueLogById(
            groupId,
            existingReservation.bookIssueLogId,
            { isReturn: true, returnDate: parsedReturnDate }
        );

        await Book.findOneAndUpdate(
            { bookId },
            { $inc: { availableCount: 1 } }
        );

        return updatedReservation;
    };
}

module.exports = new BookIssueLogService(bookIssueLogModel, "bookIssueLog");
