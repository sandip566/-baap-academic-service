const bookIssueLogModel = require("../schema/bookIssueLog.schema.js");
const BaseService = require("@baapcompany/core-api/services/base.service");
const Book = require("../schema/books.schema.js");
const Student = require("../schema/studentAdmission.schema.js");
class BookIssueLogService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteBookIssueLogById(bookIssueLogId, groupId) {
        try {
            return await bookIssueLogModel.deleteOne(bookIssueLogId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateBookIssueLogById(bookIssueLogId, newData) {
        try {
            const updateBookIssueLog = await bookIssueLogModel.findOneAndUpdate(
                { bookIssueLogId: bookIssueLogId },
                { $set: newData },
                { new: true }
            );
            return updateBookIssueLog;
        } catch (error) {
            throw error;
        }
    }

    async isBookAvailableForIssuing(addmissionId) {
        try {
            const existingReservation = await Book.findOne({
                addmissionId: addmissionId,
                returned: false,
            });
            return existingReservation;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async fetchBookIssuesWithOverdue() {
        try {
            const currentDate = new Date();
            const bookIssues = await bookIssueLogModel.find({
                returned: false,
            });

            const studentIds = bookIssues.map((issue) => issue.addmissionId);
            const bookIds = bookIssues.map((issue) => issue.bookId);

            // Fetch student and book details
            const students = await Student.find({
                addmissionId: { $in: studentIds },
            });
            const books = await Book.find({ bookId: { $in: bookIds } });

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

                    // Find corresponding student and book
                    const student = students.find(
                        (student) =>
                            student.addmissionId === bookIssue.addmissionId
                    );
                    const book = books.find(
                        (book) => book.bookId === bookIssue.bookId
                    );
                    bookIssueLogModel.updateMany(
                        { _id: bookIssue._id },
                        { $set: { isFine: true } }
                    );
                    let bookIssueDate = bookIssue.issueDate;
                    var response = {
                        bookIssueDate,
                        studentName: student
                            ? student.firstName
                            : "Unknown Student",
                        bookName: book ? book.name : "Unknown Book",
                        ISBN: book ? book.ISBN : 0,
                        daysOverdue: diffDays,
                    };
                    return response;
                });
            return {
                data: bookIssuesWithOverdue,
            };
        } catch (error) {
            throw error;
        }
    }

    async getIssueBooks(addmissionId) {
        try {
            console.log(addmissionId);
            const bookIssues = await bookIssueLogModel.countDocuments({
                returned: false,
                addmissionId: addmissionId,
            });
            const returnedBooks = await bookIssueLogModel.countDocuments({
                returned: true,
                addmissionId: addmissionId,
            });
            const totalBooksIssued = await bookIssueLogModel.countDocuments({
                addmissionId: addmissionId,
            });
            return {
                totalIssuedBooks: totalBooksIssued,
                issuedBooks: bookIssues,
                returnedBooks: returnedBooks,
            };
        } catch (error) {
            console.log(error);
        }
    }
    async getCount(groupId) {
        try {
            const bookIssues = await bookIssueLogModel.countDocuments({
                groupId: groupId,
                returned: false,
            });
            const returnedBooks = await bookIssueLogModel.countDocuments({
                groupId: groupId,
                returned: true,
            });
            const response = {
                bookIssues: bookIssues,
                returnedBooks: returnedBooks,
            };
            return response;
        } catch (error) {
            console.log(error);
        }
    }
    async getStudentDetails(groupId,criteria) {
        try {
            const searchFilter = {
                groupId: groupId,
            };
            console.log(searchFilter)
            if (criteria.search) {
                const numericSearch = parseInt(criteria.search);
                if (!isNaN(numericSearch)) {
                    searchFilter.$or = [
                        { phoneNumber: numericSearch },
                        { roleId: numericSearch },
                        { userId: numericSearch },
                        { addmissionId: numericSearch },
                    ];
                } else {
                    searchFilter.$or = [
                        { lastName: { $regex: criteria.search, $options: "i" } },
                        { name: { $regex: criteria.search, $options: "i" } },
                       // { name: { $regex: criteria.search, $options: "i" } },
                    ];
                }
            }

    
            const students = await Student.find(searchFilter);
    
            if (!students || students.length === 0) {
                return { error: "Student not found" };
            }
    

            const student = await bookIssueLogModel.find({
                addmissionId: { $in: students.map((book) => book.addmissionId) },
                returned: false,
            });
            return { searchedStudents: students, issueLogs: student };
        } catch (error) {
            console.error("Error fetching student details:", error);
            return { error: "Internal server error" };
        }
    }
}
module.exports = new BookIssueLogService(bookIssueLogModel, "bookIssueLog");
