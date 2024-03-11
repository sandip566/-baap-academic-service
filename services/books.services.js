const { query } = require("express");
const booksModel = require("../schema/books.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const bookIssueLog = require("../schema/bookIssueLog.schema");
const Student = require("../schema/studentAdmission.schema");
const departmentModel = require("../schema/department.schema");
const shelfModel = require("../schema/shelf.schema");

class BooksService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    //    async getAllDataByGroupId(groupId, criteria,skip,limit) {

    //             const searchFilter = {
    //                 groupId: groupId,
    //             };
    //             if (criteria.search) {
    //                 const numericSearch = parseInt(criteria.search);
    //                 if (!isNaN(numericSearch)) {
    //                     searchFilter.$or = [
    //                         { ISBN: numericSearch },
    //                         { shelfId: numericSearch },
    //                         { price: numericSearch },
    //                         { departmentId: numericSearch },
    //                         { totalCount: numericSearch },
    //                         { availableCount: numericSearch },
    //                     ];
    //                 } else {
    //                     searchFilter.$or = [
    //                         { status: { $regex: criteria.search, $options: "i" } },
    //                         { name: { $regex: criteria.search, $options: "i" } },
    //                         { author: { $regex: criteria.search, $options: "i" } },
    //                         {
    //                             publisher: {
    //                                 $regex: criteria.search,
    //                                 $options: "i",
    //                             },
    //                         },
    //                        // { RFID: criteria.search },
    //                     ];
    //                 }
    //             }
    //             if (criteria.publisher){
    //                 searchFilter.publisher=criteria.publisher
    //             }
    //             if (criteria.shelfId) {
    //                 searchFilter.shelfId = criteria.shelfId;
    //             }
    //             if (criteria.departmentId) {
    //                 searchFilter.department = criteria.departmentId;
    //             }
    //             if (criteria.departmentId) {
    //                 searchFilter['departmentId.departmentName'] = { $regex: new RegExp(criteria.departmentName, 'i') };
    //             }
    //             console.log(searchFilter)
    //             return searchFilter;
    //     //     } catch (error) {
    //     //         console.log(error);
    //     //         throw error;
    //     //     }
    //     }
    async getAllDataByGroupId(groupId, criteria, skip, limit) {
        try {
            const searchFilter = {
                groupId: groupId,
            };
            const departmentMap = await this.getDepartmentMap();
            const shelfMap = await this.getShelfMap();

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
                    const departmentId =
                        departmentMap[criteria.search.trim().toLowerCase()];
                    const shelfId =
                        shelfMap[criteria.search.trim().toLowerCase()];
                    searchFilter.$or = [
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
                        {
                            publisher: {
                                $regex: new RegExp(criteria.search, "i"),
                            },
                        },
                        { departmentId: departmentId },
                        {
                            departmentName: {
                                $regex: new RegExp(criteria.search, "i"),
                            },
                        }, // Add departmentName search
                        { shelfId: shelfId },
                        {
                            shelfName: {
                                $regex: new RegExp(criteria.search, "i"),
                            },
                        },
                    ];
                }
            }

            if (criteria.publisher) {
                searchFilter.publisher = {
                    $regex: new RegExp(criteria.publisher, "i"),
                };
            }

            // const departmentMap = await this.getDepartmentMap();

            if (criteria.departmentName) {
                const departmentNameLowerCase =
                    criteria.departmentName.toLowerCase();
                const departmentId = departmentMap[departmentNameLowerCase];
                if (departmentId) {
                    searchFilter.departmentId = departmentId;
                } else {
                    // If the provided department name doesn't exist in the department map, return empty result
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

            // Remove departmentName from criteria as it's been processed
            delete criteria.departmentName;

            return { searchFilter, departmentMap };
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
                // Trim and convert to lowercase before adding to the map
                const departmentName = department.departmentName
                    .trim()
                    .toLowerCase();
                departmentMap[departmentName] = department.departmentId;
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
                // Check if shelfName exists before trimming and converting to lowercase
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
            if (!books) {
                console.log("No books found in the database.");
                return 0;
            }
            let totalCount = 0;
            for (const book of books) {
                totalCount += book.availableCount || 0;
            }
            return totalCount;
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
                        { ISBN: numericSearch },
                        { shelfId: numericSearch },
                        { price: numericSearch },
                        { departmentId: numericSearch },
                        { totalCount: numericSearch },
                        { availableCount: numericSearch },
                    ];
                } else {
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

            const populatedBooks = await Promise.all(
                books.map(async (book) => {
                    const shelf = await shelfModel.findOne({
                        shelfId: book.shelfId,
                    });
                    const department = await departmentModel.findOne({
                        departmentId: book.departmentId,
                    });
                    return { ...book._doc, shelf, department };
                })
            );
            if (!books) {
                return { error: "Book not found" };
            }
            const issueLogs = await bookIssueLog.find({
                bookId: { $in: books.map((book) => book.bookId) },
                returned: false,
            });

            const studentIds = issueLogs.map((issue) => issue.addmissionId);
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
                issueDate: issue.issueDate,
            }));

            return { populatedBooks: populatedBooks, issueLogs: data };
        } catch (error) {
            console.error("Error fetching book details:", error);
            return { error: "Internal server error" };
        }
    }
    async getShelfId(bookId) {
        try {
            const book = await booksModel.findOne({ bookId: bookId })
            return book.shelfId;
        } catch (error) {
            console.log()
        }
    }
}
module.exports = new BooksService(booksModel, "books");
