const bookIssueLogModel = require("../schema/bookIssueLog.schema.js");
const BaseService = require("@baapcompany/core-api/services/base.service");
const Book = require("../schema/books.schema.js");
const studentAdmissionModel = require("../schema/studentAdmission.schema.js");
const { addListener } = require("../schema/publisher.schema.js");
const studentAdmissionServices = require("./studentAdmission.services.js");
const StudentsAdmissionModel = require("../schema/studentAdmission.schema.js");
class BookIssueLogService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getAllDataByGroupId(groupId, criteria) {
        try { 
            const searchFilter = {
                groupId
            };
            const bookMap = await this.getBookMap();
            const studentMap = await this.getStudentMap();
            if (criteria.search) {
                const numericSearch = parseInt(criteria.search);
                if (!isNaN(numericSearch)) {
                    searchFilter.$or = [
                        { userId: numericSearch },
                        { bookIssueLogId: numericSearch },
                    ];
                } else {
                    const bookId =
                        bookMap[criteria.search.trim().toLowerCase()];
                    const addmissionId =
                        studentMap[criteria.search.trim().toLowerCase()];
                    searchFilter.$or = [
                        { bookId: bookId },
                        {
                            name: {
                                $regex: new RegExp(criteria.search, "i"),
                            },
                        },

                        // {
                        //     ISBN: {
                        //         searchFilter.search = criteria.search
                        //     },
                        // },

                        { addmissionId: addmissionId },
                        {
                            firstName: {
                                $regex: new RegExp(criteria.search, "i"),
                            },
                        },
                    ];
                }
                
            }
            if (criteria.isReturn) {
                searchFilter.isReturn = criteria.isReturn;
            }
            if (criteria.status) {
                searchFilter.status = criteria.status;
            }
            if (criteria.isOverdue) {
                searchFilter.isOverdue = criteria.isOverdue;
            }

            const bookIssueLog = await bookIssueLogModel.find(searchFilter);
            const populatedBooks = await Promise.all(
                bookIssueLog.map(async (book) => {
                    const books = await Book.findOne({
                        bookId: book.bookId,
                    });
                    const student = await studentAdmissionModel.findOne({
                        addmissionId: book.addmissionId,
                    });
                    return { ...book._doc, books, student };
                })
            );
            const count= await this.getCount(groupId)
            const totalCount = await bookIssueLogModel.countDocuments(populatedBooks);
            return { populatedBookIssueLog: populatedBooks,count:count,totalCount:totalCount };
        } catch (error) {
            console.error("Error in getAllDataByGroupId:", error);
            throw new Error("An error occurred while processing the request.");
        }
    }

    async getBookMap() {
        try {
            const books = await Book.find();
            const bookMap = {};
            books.forEach((book) => {
                if (book.name) {
                    const name = book.name.trim().toLowerCase();
                    bookMap[name] = book.bookId;
                }
            });
            return bookMap;
        } catch (error) {
            console.error("Error fetching book map:", error);
            throw new Error("An error occurred while fetching book map.");
        }
    }
    async getStudentMap() {
        try {
            const students = await studentAdmissionModel.find();
            const studentMap = {};
            students.forEach((student) => {
                if (student.firstName) {
                    const firstName = student.firstName.trim().toLowerCase();
                    studentMap[firstName] = student.addmissionId;
                }
            });
            return studentMap;
        } catch (error) {
            console.error("Error fetching student map:", error);
            throw new Error("An error occurred while fetching student map.");
        }
    }

    async deleteBookIssueLogById(bookIssueLogId, groupId) {
        try {
            return await bookIssueLogModel.deleteOne(bookIssueLogId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateBookIssueLogById(bookIssueLogId, newData) {
        try {
            const updateBookIssueLog = await bookIssueLogModel.findOneAndUpdate(
                { bookIssueLogId: bookIssueLogId },
                { $set: newData },
                { new: true }
            );
            return updateBookIssueLog;
        } catch (error) {
            throw error;
        }
    }

    async checkOverdueStatus(addmissionId) {
        try {
            const existingReservation = await bookIssueLogModel.findOne({
                addmissionId: addmissionId,
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

    async fetchBookIssuesWithOverdue(groupId) {
        try {
            const currDate = new Date();
            const bookIssues = await bookIssueLogModel.find({
                groupId: groupId,
                isReturn: false,
            });

            const studentIds = bookIssues.map((issue) => issue.addmissionId);
            const bookIds = bookIssues.map((issue) => issue.bookId);
            const students = await studentAdmissionModel.find({
                addmissionId: { $in: studentIds },
            });
            const books = await Book.find({ bookId: { $in: bookIds } });
            await Promise.all(
                bookIssues.map(async (bookIssue) => {
                    const dueDate = new Date(bookIssue.dueDate);
                    const diffTime = currDate - dueDate;
                    const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24)
                    );

                    if (diffDays > 0) {
                        await bookIssueLogModel.updateOne(
                            { _id: bookIssue._id },
                            { $set: { isOverdue: true } }
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
                    return diffDays > 0;
                })
                .map((bookIssue) => {
                    const dueDate = new Date(bookIssue.dueDate);
                    const diffTime = currDate - dueDate;
                    const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24)
                    );
                    const student = students.find(
                        (student) =>
                            student.addmissionId === bookIssue.addmissionId
                    );
                    const book = books.find(
                        (book) => book.bookId === bookIssue.bookId
                    );
                    let bookIssueDate = bookIssue.issueDate;
                    var response = {
                        bookIssueDate,
                        studentName: student ? student.name : "Unknown Student",
                        image: student
                            ? student.profile_img
                            : "image is not provided",
                        bookName: book ? book.name : "Unknown Book",
                        ISBN: book ? book.ISBN : 0,
                        daysOverdue: diffDays,
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

    async getIssueBooks(addmissionId) {
        try {
            console.log(addmissionId);
            const bookIssues = await bookIssueLogModel.countDocuments({
                isReturn: false,
                addmissionId: addmissionId,
            });
            const returnedBooks = await bookIssueLogModel.countDocuments({
                isReturn: true,
                addmissionId: addmissionId,
            });
            const totalBooksIssued = await bookIssueLogModel.countDocuments({
                addmissionId: addmissionId,
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
            const reserveBooks=await bookIssueLogModel.countDocuments({
                groupId:groupId,
                status:"Reserved"
            })
            const response = {
                bookIssues: bookIssues,
                returnedBooks: returnedBooks,
                reserveBooks:reserveBooks
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
            console.log(students);
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
                    bookIssueDate: item.issueDate,
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
    async reserveBook(groupId, bookId) {
        try {
            const book = await Book.find({ groupId: groupId, bookId: bookId });
            return book;
        } catch (error) {
            throw error;
        }
    }

    async checkBookAvailability(groupId,bookId){
        try {
            const book = await Book.find({ groupId: groupId, bookId: bookId });
            console.log(book)
            return book
        } catch (error) {
           throw error; 
        }
    }
}

module.exports = new BookIssueLogService(bookIssueLogModel, "bookIssueLog");
