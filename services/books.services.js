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
                    { title: { $regex: criteria.search, $options: "i" } },
                    { author: { $regex: criteria.search, $options: "i" } },
                    { ISBN: numericSearch },
                    { RFID: criteria.search } // Assuming RFID is searched as exact match
                ];
            } else {
                searchFilter.$or = [
                    { title: { $regex: criteria.search, $options: "i" } },
                    { author: { $regex: criteria.search, $options: "i" } },
                    { RFID: criteria.search } // Assuming RFID is searched as exact match
                ];
            }
        }
    
        if (criteria.availableCount) {
            searchFilter.availableCount = criteria.availableCount;
        }
    
        if (criteria.totalCopies) {
            searchFilter.totalCopies = criteria.totalCopies;
        }
    
        if (criteria.shelfId) {
            searchFilter.shelfId = criteria.shelfId;
        }
    
        if (criteria.status) {
            searchFilter.status = criteria.status;
        }
        if (criteria.title) {
            searchFilter.title= criteria.title;
        }
    } catch (error) {
         console.log(error)
    }
}      

// getAllDataByGroupId(groupId, criteria) {
//     const query = {
//         groupId: groupId,
//     };
    
//     if (criteria.search) {
//         const searchRegex = new RegExp(criteria.search, "i");
        
//         if (criteria.title) {
//             query.title = searchRegex;
//         } else {
//             const searchData  await this.model.aggregate([
               
//                 { $match: { ...query, title: searchRegex } }
//             ]);

//             if (searchData.length > 0) {
//                 return { success: true, data: searchData };
//             } else {
//                 return { success: false, message: "No data found for the provided search criteria" };
//             }
//         }
//     }

//     // If no search criteria provided or if it's specifically for a title, return all data
//     const allData = await this.preparePaginationAndReturnData(query, criteria);

//     if (allData.length > 0) {
//         return { success: true, data: allData };
//     } else {
//         return { success: false, message: "No data found" };
//     }
// }



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


    async getTotalBooks() {
        try {
          const books = await booksModel.find();
          let totalCount = 0;
          for (const book of books) {
            totalCount += book.totalCopies;
          }
          return totalCount;
        } catch (error) {
          throw error;
        }
    }
}
module.exports = new BooksService(booksModel, "books");
