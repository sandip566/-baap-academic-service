const { query } = require("express");
const booksModel = require("../schema/books.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
//const bookIssueLog = require("../schema/bookIssueLog.schema");
const Student = require("../schema/studentAdmission.schema");
const departmentModel = require("../schema/department.schema");
const shelfModel = require("../schema/shelf.schema");
const publisherModel = require("../schema/publisher.schema");
const bookIssueLogService = require("../services/bookIssueLog.service");
const bookIssueLogModel = require("../schema/bookIssueLog.schema");
class BooksService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getAllDataByGroupId(groupId, criteria, skip, limit) {
        try {
            const searchFilter = {
                groupId: groupId,
            };
            const departmentMap = await this.getDepartmentMap();
            const shelfMap = await this.getShelfMap();
            const publisherMap = await this.getPublisherMap();

            if (criteria.search) {
                const numericSearch = parseInt(criteria.search);
                if (!isNaN(numericSearch)) {
                    searchFilter.$or = [
                        { ISBN: numericSearch },
                        { shelfId: numericSearch },
                        { price: numericSearch },
                        { departmentId: numericSearch },
                        { totalCount: numericSearch },
                        { availableCount: numericSearch },
                    ];
                } else {

                    const shelfId =
                        shelfMap[criteria.search.trim().toLowerCase()];
                    searchFilter.$or = [

                        { shelfId: shelfId },
                        {
                            shelfName: {
                                $regex: new RegExp(criteria.search, "i"),
                            },
                        },

                        {
                            status: {
                                $regex: new RegExp(criteria.search, "i"),
                            },
                        },
                        { name: { $regex: new RegExp(criteria.search, "i") } },
                        {
                            author: {
                                $regex: new RegExp(criteria.search, "i"),
                            },
                        },

                    ];
                }
            }

            if (criteria.departmentName) {
                const departmentNameLowerCase =
                    criteria.departmentName.toLowerCase();
                const departmentId = departmentMap[departmentNameLowerCase];
                if (departmentId) {
                    searchFilter.departmentId = departmentId;
                } else {
                    return { searchFilter: {}, departmentMap: {} };
                }
            }


            if (criteria.shelfName) {
                const shelfnameLowercase = criteria.shelfName.toLowerCase();
                const shelfId = shelfMap[shelfnameLowercase];
                if (shelfId) {
                    searchFilter.shelfId = shelfId;
                } else {
                    return { searchFilter: {}, shelfMap: {} };
                }
            }

            if (criteria.publisherName) {
                const publishernameLowercase =
                    criteria.publisherName.toLowerCase();
                const publisherId = publisherMap[publishernameLowercase];
                if (publisherId) {
                    searchFilter.publisherId = publisherId;
                } else {
                    return { searchFilter: {}, publisherMap: {} };
                }
            }
            console.log(publisherMap);

            return { searchFilter };
        } catch (error) {
            console.error("Error in getAllDataByGroupId:", error);
            throw new Error("An error occurred while processing the request.");
        }
    }

    async getDepartmentMap() {
        try {
            const departments = await departmentModel.find();
            const departmentMap = {};
            departments.forEach((department) => {
                if (department.departmentName) {
                    const departmentName = department.departmentName.trim().toLowerCase();
                    departmentMap[departmentName] = department.departmentId;
                }
            });
            return departmentMap;
        } catch (error) {
            console.error("Error fetching department map:", error);
            throw new Error("An error occurred while fetching department map.");
        }
    }
    async getShelfMap() {
        try {
            const shelves = await shelfModel.find();
            const shelfMap = {};
            shelves.forEach((shelf) => {
                if (shelf.shelfName) {
                    const shelfName = shelf.shelfName.trim().toLowerCase();
                    shelfMap[shelfName] = shelf.shelfId;
                }
            });
            return shelfMap;
        } catch (error) {
            console.error("Error fetching shelf map:", error);
            throw new Error("An error occurred while fetching shelf map.");
        }
    }
    async getPublisherMap() {
        const publishers = await publisherModel.find();
        const publisherMap = {};
        publishers.forEach((publisher) => {
            if (publisher.publisherName) {
                const publisherName = publisher.publisherName.trim().toLowerCase();
                publisherMap[publisherName] = publisher.publisherId;
            }
        });
        return publisherMap;
    }
    catch(error) {
        console.error("Error fetching publisher map:", error);
        throw new Error("An error occurred while fetching publisher map.");
    }

    async deleteBookById(groupId,bookId) {
        try {
            console.log(bookId)
            const isIssuedBook = await bookIssueLogModel.findOne({ bookId: bookId });
            console.log(isIssuedBook);
            if (isIssuedBook) {
                return false;
            } else {
                const result = await booksModel.deleteOne({groupId: groupId,bookId: bookId });
                return result;
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
            const books = await booksModel.find({ groupId: groupId });
            if (!books) {
                console.log("No books found in the database.");
                return 0;
            }
            let totalAvailableCount = 0;
            let totalCount = 0;
            for (const book of books) {
                totalAvailableCount += book.availableCount || 0;
            }
            for (const book of books) {
                totalCount += book.totalCopies || 0;
            }
            const count = await bookIssueLogService.getCount(groupId);
            const response = {
                totalCount: totalCount,
                totalAvailableCount: totalAvailableCount,
                totalIssuedBooks: count.bookIssues,
                totalReturnedBooks: count.returnedBooks,
            };
            return response;
        } catch (error) {
            console.error("Error in getTotalAvailableBooks:", error);
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
                    searchFilter.$or = [
                        { ISBN: numericSearch }
                     ];
                } else {
                    searchFilter.$or = [
                        { RFID: criteria.search },
                    ];
                }
            }

            if (criteria.shelfId) {
                searchFilter.shelfId = criteria.shelfId;
            }
            if (criteria.departmentId) {
                searchFilter.departmentId = criteria.departmentId;
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
            const studentIds = issueLogs.map((issue) => issue.addmissionId);
            console.log(studentIds)
            const students = await Student.find({
                addmissionId: { $in: studentIds },
            });
            const studentMap = {};
            students.forEach((student) => {
                studentMap[student.addmissionId] = student.firstName;
            });

            const data = issueLogs.map((issue) => ({
                studentName:
                    studentMap[issue.addmissionId] || "Unknown Student",
                issueDate: issue.issuedDate,
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
