const bookIssueLogModel = require("../schema/bookIssueLog.schema.js");
const BaseService = require("@baapcompany/core-api/services/base.service");
const Book = require('../schema/books.schema.js');

class BookIssueLogService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.bookIssueLogId) query.phone = criteria.bookIssueLogId;
        if (criteria.studentId) query.studentId = new RegExp(criteria.studentId, "i");
        if (criteria.returned) query.returned = new RegExp(criteria.returned, "i");
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
            const existingReservation = await Book.findOne({ bookId: bookId, returned: false });
            return !existingReservation;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
module.exports = new BookIssueLogService(bookIssueLogModel, "bookIssueLog");
