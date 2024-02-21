const { query } = require("express");
const booksModel = require("../schema/books.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class BooksService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    
    async getAllDataByGroupId(groupId, publisher, department, shelf, search, page = 1, pageSize = 10) {
        try {
            let query = {
                groupId: groupId
            };
    
            if (publisher) {
                query.publisher = publisher;
            }
            if (department) {
                query.department = department;
            }
            if (shelf) {
                query.shelf = shelf;
            }
    
            if (search) {
                const numericSearch = parseInt(search);
                if (!isNaN(numericSearch)) {
                    query.$or = [
                        { name: { $regex: search, $options: 'i' } },
                        { shelf: numericSearch },
                        { price: numericSearch },
                    ];
                } else {
                    query.$or = [
                        { name: { $regex: search, $options: 'i' } },
                        { department: { $regex: search, $options: 'i' } },
                        { publisher: { $regex: search, $options: 'i' } },
                    ];
                }
            }
    
            const totalItems = await booksModel.countDocuments(query);
            const totalPages = Math.ceil(totalItems / pageSize);   

            let bookData = await booksModel.find(query)
                .skip((page - 1) * pageSize)
                .sort({createdAt:-1})
                .limit(Number(pageSize))
                .exec();
    
            return {
                data: {
                    items: bookData,
                    totalItems: totalItems,
                    totalPages: totalPages,
                    currentPage: page
                }
            };
        } catch (error) {
            console.error(error);
            throw error;
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

}
module.exports = new BooksService(booksModel, "books");
