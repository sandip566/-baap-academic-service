const { query } = require("express");
const booksModel = require("../schema/books.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const bookIssueLog = require("../schema/bookIssueLog.schema");
const Student = require("../schema/student.schema");
class BooksService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    
    // async getAllDataByGroupId(groupId, publisher, department, shelf, search, page = 1, pageSize = 10) {
    //     try {
    //         let query = {
    //             groupId: groupId
    //         };
    
    //         if (publisher) {
    //             query.publishaer = publisher;
    //         }
    //         if (department) {
    //             query.department = department;
    //         }
    //         if (shelf) {
    //             query.shelf = shelf;
    //         }
    
    //         if (search) {
    //             const numericSearch = parseInt(search);
    //             if (!isNaN(numericSearch)) {
    //                 query.$or = [
    //                     { name: { $regex: search, $options: 'i' } },
    //                     { shelf: numericSearch },
    //                     { price: numericSearch },
    //                 ];
    //             } else {
    //                 query.$or = [
    //                     { name: { $regex: search, $options: 'i' } },
    //                     { department: { $regex: search, $options: 'i' } },
    //                     { publisher: { $regex: search, $options: 'i' } },
    //                 ];
    //             }
    //         }
    
    //         const totalItems = await booksModel.countDocuments(query);
    //         const totalPages = Math.ceil(totalItems / pageSize);   

    //         let bookData = await booksModel.find(query)
    //             .skip((page - 1) * pageSize)
    //             .sort({createdAt:-1})
    //             .limit(Number(pageSize))
    //             .exec();
    
    //         return {
    //             data: {
    //                 items: bookData,
    //                 totalItems: totalItems,
    //                 totalPages: totalPages,
    //                 currentPage: page
    //             }
    //         };
    //     } catch (error) {
    //         console.error(error);
    //         throw error;
    //     }
    // }
    

    getAllDataByGroupId(groupId, criteria,skip,limit) {
        try {
            const searchFilter = {
                groupId: groupId,
            };
            if (criteria.search) {
                const numericSearch = parseInt(criteria.search);
                if (!isNaN(numericSearch)) {
                    // Numeric search
                    searchFilter.$or = [
                        { ISBN: numericSearch },
                        { shelfId: numericSearch },
                        { price: numericSearch },
                        { departmentId: numericSearch },
                        { totalCount: numericSearch },
                        { availableCount: numericSearch },
                    ];
                } else {
                    // Non-numeric search
                    searchFilter.$or = [
                        { status: { $regex: criteria.search, $options: "i" } },
                        { name: { $regex: criteria.search, $options: "i" } },
                        { author: { $regex: criteria.search, $options: "i" } },
                        {
                            publisher: {
                                $regex: criteria.search,
                                $options: "i",
                            },
                        },
                        { RFID: criteria.search }, // Assuming RFID is searched as exact match
                    ];
                }
            }
            if (criteria.shelfId) {
                searchFilter.shelfId = criteria.shelfId;
            }
            if (criteria.departmentId) {
                searchFilter.departmentId = criteria.departmentId;
            }
            return searchFilter;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    
    
    
    async deleteBookById(bookId, groupId) {
        try {
            return await booksModel.deleteOne(bookId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateBookById(bookId, groupId, newData) {
        try {
            const updateBook = await booksModel.findOneAndUpdate(
                { bookId: bookId, groupId: groupId },
                newData,
                { new: true }
            );
            return updateBook;
        } catch (error) {
            throw error;
        }
    }
    async getTotalAvailableBooks() {
        try {
            const books = await booksModel.find();
            let totalCount = 0;
            for (const book of books) {
                totalCount += book.availableCount;
            }
            return totalCount;
        } catch (error) {
            throw error;
        }
    }

    async getBookDetails(groupId, criteria) {
        try {
            const searchFilter = {
                groupId: groupId,
            };

            if (criteria.search) {
                const numericSearch = parseInt(criteria.search);
                if (!isNaN(numericSearch)) {
                    // Numeric search
                    searchFilter.$or = [
                        { ISBN: numericSearch },
                        { shelfId: numericSearch },
                        { price: numericSearch },
                        { departmentId: numericSearch },
                        { totalCount: numericSearch },
                        { availableCount: numericSearch },
                    ];
                } else {
                    // Non-numeric search
                    searchFilter.$or = [
                        { status: { $regex: criteria.search, $options: "i" } },
                        { name: { $regex: criteria.search, $options: "i" } },
                        { author: { $regex: criteria.search, $options: "i" } },
                        {
                            publisher: {
                                $regex: criteria.search,
                                $options: "i",
                            },
                        },
                        { RFID: criteria.search }, // Assuming RFID is searched as exact match
                    ];
                }
            }

            if (criteria.shelfId) {
                searchFilter.shelfId = criteria.shelfId;
            }
            if (criteria.departmentId) {
                searchFilter.departmentId = criteria.departmentId;
            }

            const book = await booksModel.findOne(searchFilter);
            if (!book) {
                return { error: "Book not found" };
            }
            const issueLogs = await bookIssueLog.find({ bookId: book.bookId });
            const studentIds = issueLogs.map((issue) => issue.studentId);
            const students = await Student.find({
                studentId: { $in: studentIds },
            });

            // Create a map to easily retrieve student names by studentId
            const studentMap = {};
            students.forEach((student) => {
                studentMap[student.studentId] = student.firstName;
            });

            // Map issueLogs to include student names
            const data = issueLogs.map((issue) => ({
                studentName: studentMap[issue.studentId] || "Unknown Student",
                issueDate: issue.issueDate,
            }));

            return { book, issueLogs: data };
        } catch (error) {
            console.error("Error fetching book details:", error);
            return { error: "Internal server error" };
        }
    }
}
module.exports = new BooksService(booksModel, "books");
