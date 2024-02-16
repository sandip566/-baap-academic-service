const bookIssueLogModel = require("../schema/bookIssueLog.schema.js");
const BaseService = require("@baapcompany/core-api/services/base.service");
const Book = require("../schema/books.schema.js");

class BookIssueLogService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.bookIssueLogId) query.phone = criteria.bookIssueLogId;
        if (criteria.studentId) query.studentId = criteria.studentId;
        if (criteria.returned)
            query.returned = new RegExp(criteria.returned, "i");
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteBookIssueLogById(bookIssueLogId, groupId) {
        try {
            return await bookIssueLogModel.deleteOne(bookIssueLogId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateBookIssueLogById(bookIssueLogId, groupId, newData) {
        try {
            const updateBookIssueLog = await bookIssueLogModel.findOneAndUpdate(
                { _id: bookIssueLogId, groupId: groupId },
                { $set: newData },
                { new: true }
            );
            return updateBookIssueLog;
        } catch (error) {
            throw error;
        }
    }

    async isBookAvailableForIssuing(bookId) {
        try {
            const existingReservation = await Book.findOne({
                bookId: bookId,
                returned: false,
            });
            return !existingReservation;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    async letCountDouments() {
        try {
            const count = await bookIssueLogModel.countDocuments({
                returned: false,
            });
            return count;
        } catch (error) {
            throw error;
        }
    }

    async fetchBookIssuesWithOverdue() {
        try {
            const currentDate = new Date();
            const bookIssues = await bookIssueLogModel.find();
            const bookIssuesWithOverdue = bookIssues
                .filter((bookIssue) => {
                    const dueDate = new Date(bookIssue.dueDate);
                    const diffTime = currentDate - dueDate;
                    const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24)
                    );
                    return diffDays > 0;
                })
                .map((bookIssue) => {
                    const dueDate = new Date(bookIssue.dueDate);
                    const diffTime = currentDate - dueDate;
                    const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24)
                    );
                    return {
                        bookIssue,
                        daysOverdue: diffDays,
                    };
                });
            return bookIssuesWithOverdue;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new BookIssueLogService(bookIssueLogModel, "bookIssueLog");
