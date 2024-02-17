const { query } = require("express");
const booksModel = require("../schema/books.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class BooksService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    getAllDataByGroupId(groupId, criteria) {
        try {
            const searchFilter = {
                groupId: groupId,
            };
    
            if (criteria.search) {
                const numericSearch = parseInt(criteria.search);
                if (!isNaN(numericSearch)) {
                    searchFilter.$or = [
                        { ISBN: numericSearch },
                        { department: numericSearch },
                        { price: numericSearch },
                        { availableCount: numericSearch },
                    ];
                } else {
                    searchFilter.$or = [
                        { status: { $regex: criteria.search, $options: "i" } },
                        { title: { $regex: criteria.search, $options: "i" } },
                        { author: { $regex: criteria.search, $options: "i" } },
                        { publisher: { $regex: criteria.search, $options: "i" } },
                        { RFID: criteria.search } // Assuming RFID is searched as exact match
                    ];
                }
            }
    
            if (criteria.shelfId) {
                searchFilter.shelfId = criteria.shelfId;
            }
            if (criteria.department) {
                searchFilter.department = criteria.department;
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
          const books = await booksModel.find({returned:false});
          let totalCount = 0;
          for (const book of books) {
            totalCount += book.availableCount;
          }
          return totalCount;
        } catch (error) {
          throw error;
        }
    }

}
module.exports = new BooksService(booksModel, "books");
