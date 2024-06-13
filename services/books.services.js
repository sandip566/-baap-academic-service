const { query } = require("express");
const booksModel = require("../schema/books.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const shelfModel = require("../schema/shelf.schema");
const bookIssueLogService = require("../services/bookIssueLog.service");
const bookIssueLogModel = require("../schema/bookIssueLog.schema");
class BooksService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getAllDataByGroupId(groupID, criteria) {
        try {
            const groupId = parseInt(groupID);
            if (isNaN(groupId)) {
                throw new Error("Invalid groupID");
            }
            const searchFilter = { groupId };
            const aggregationPipeline = [
                {
                    $match: searchFilter
                },
                {
                    $lookup: {
                        from: "shelves",
                        localField: "shelfId",
                        foreignField: "shelfId",
                        as: "shelf"
                    }
                },
                {
                    $unwind: {
                        path: "$shelf",
                        preserveNullAndEmptyArrays: true
                    }
                }
            ];
            if (criteria.search) {
                const searchRegex = new RegExp(criteria.search.trim(), "i");
                aggregationPipeline.push({
                    $match: {
                        $or: [
                            { "shelf.shelfName": searchRegex },
                            { userId: { $eq: parseInt(criteria.search) } },
                            { name: searchRegex },
                            { ISBN: { $eq: parseInt(criteria.search) } },
                            { author: searchRegex },
                            { totalCopies: { $eq: parseInt(criteria.search) } },
                            { availableCount: { $eq: parseInt(criteria.search) } }
                        ]
                    }
                });
            }

            if (criteria.userId) {
                aggregationPipeline.push({ $match: { userId: parseInt(criteria.userId) } });
            }
            const pageNumber = parseInt(criteria.pageNumber) || 1;
            const pageSize = parseInt(criteria.pageSize) || 10;
            aggregationPipeline.push(
                { $skip: (pageNumber - 1) * pageSize },
                { $limit: pageSize }
            );
            const populatedBook = await booksModel.aggregate(aggregationPipeline);
            const totalCount = await booksModel.countDocuments(searchFilter);
            const count = await this.getBooksCount(groupId);
            return {
                status: "Success",
                populatedBook,
                count,
                totalCount
            };
        } catch (error) {
            console.error("Error in getAllDataByGroupId:", error);
            throw new Error("An error occurred while processing the request. Please try again later.");
        }
    }
    async deleteBookById(groupId, bookId) {
        try {
            const groupID = parseInt(groupId);
            const bookID = parseInt(bookId);
            const isIssuedBook = await bookIssueLogModel.find({
                groupId: groupID,
                bookId: bookID,
            });
            if (isIssuedBook.length === 0) {
                const result = await booksModel.deleteOne({
                    groupId: groupID,
                    bookId: bookID,
                });
                return result;
            } else {
                return false;
            }
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
    async getBooksCount(groupId) {
        try {
            const aggregationPipeline = [
                {
                    $match: { groupId: groupId }
                },
                {
                    $group: {
                        _id: null,
                        totalAvailableCount: { $sum: "$availableCount" },
                        totalCount: { $sum: "$totalCopies" }
                    }
                }
            ];
            const result = await booksModel.aggregate(aggregationPipeline);
            let totalAvailableCount = 0;
            let totalCount = 0;
            if (result.length > 0) {
                totalAvailableCount = result[0].totalAvailableCount || 0;
                totalCount = result[0].totalCount || 0;
            }
            const count = await bookIssueLogService.getCount(groupId);
            const response = {
                totalCount: totalCount,
                totalAvailableCount: totalAvailableCount,
                totalIssuedBooks: count.bookIssues,
                totalReturnedBooks: count.returnedBooks
            };
            return response;
        } catch (error) {
            console.error("Error in getBooksCount:", error);
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
                    searchFilter.$or = [{ ISBN: numericSearch }];
                } else {
                    searchFilter.$or = [
                        {
                            name: {
                                $regex: new RegExp(criteria.search, "i"),
                            },
                        },
                    ];

                }
            }
            const books = await booksModel.find(searchFilter);
            if (!books || books.length === 0) {
                return { error: "Books not found" };
            }
            const populatedBooks = await Promise.all(
                books.map(async (book) => {
                    const shelf = await shelfModel.findOne({
                        shelfId: book.shelfId,
                    });

                    return { ...book._doc, shelf };
                })
            );

            const issueLogs = await bookIssueLogModel.find({
                bookId: { $in: books.map((book) => book.bookId) },
                isReturn: false,
            });
            console.log(issueLogs);
            const data = issueLogs.map((issue) => ({
                studentName: issue.name,
                issueDate: issue.issuedDate,
                bookIssueLogId: issue.bookIssueLogId,
                userId: issue.userId,
                addmissionId: issue.addmissionId,
                isOverdue: issue.isOverdue,
                url: issue.profile_img
            }));
            return {
                data: "books",
                populatedBooks: populatedBooks,
                issueLogs: data,
            };
        } catch (error) {
            console.error("Error fetching book details:", error);
            return { error: "Internal server error" };
        }
    }
    async getShelfId(bookId) {
        try {
            const book = await booksModel.findOne({ bookId: bookId });

            return book.shelfId;
        } catch (error) { }
    }
}
module.exports = new BooksService(booksModel, "books");
