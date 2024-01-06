const booksModel = require("../schema/books.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class CourseService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.title) query.title = new RegExp(criteria.title, "i");
        if (criteria.author) query.author = new RegExp(criteria.author, "i");
        if (criteria.publicationDate) query.publicationDate = new RegExp(criteria.publicationDate);
        return this.preparePaginationAndReturnData(query, criteria);
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
}
module.exports = new CourseService(booksModel, "books");
