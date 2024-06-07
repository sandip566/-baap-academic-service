const bookIssueLogModel = require("../schema/bookIssueLog.schema");
const LibraryPaymentModel = require("../schema/librarypayment.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const configurationModel = require("../schema/configuration.schema");
class LibraryPaymentService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getAllDataByGroupId(groupId, criteria, page, limit) {
        try {
            const query = {
                groupId: Number(groupId),
            };
            if (criteria.search) {
                const numericSearch = parseInt(criteria.search);
                if (!isNaN(numericSearch)) {
                    query.$or = [
                        { paidAmount: numericSearch }
                    ];
                }
                 else {
                    query.$or = [
                        {
                            username: {
                                $regex: new RegExp(criteria.search, "i"),
                            },
                        },
                       
                    ];
                }
             }

            if (criteria.libraryPaymentId)
                query.libraryPaymentId = criteria.libraryPaymentId;
            if (criteria.empId) query.empId = criteria.empId;
            if (criteria.userId) query.userId = criteria.userId;
            const pageSize = limit || 10;
            const currentPage = page || 1;
            const skip = (currentPage - 1) * pageSize;
            const pipeLine = await LibraryPaymentModel.aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: "studentsadmissions",
                        localField: "addmissionId",
                        foreignField: "addmissionId",
                        as: "addmissionId",
                    },
                },
                { $unwind: "$addmissionId" },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: pageSize },
            ]).exec();

            const totalDocuments = await LibraryPaymentModel.countDocuments(
                query
            );
            const totalPages = Math.ceil(totalDocuments / pageSize);
            const response = {
                status: "Success",
                data: pipeLine,
                totalItemsCount: totalDocuments,
                totalPages: totalPages,
                pageSize: pageSize,
                currentPage: currentPage,
            };

            return response;
        } catch (error) {
            console.error("Error in getAllDataByGroupId:", error);
            throw error;
        }
    }

    async deleteLibraryPaymentById(libraryPaymentId, groupId) {
        try {
            return await LibraryPaymentModel.deleteOne(
                libraryPaymentId,
                groupId
            );
        } catch (error) {
            throw error;
        }
    }
    async getPenalty(groupId, userId, bookIssueLogId) {
        try {
            let configurationsData = await configurationModel.findOne({
                groupId: groupId,
            });
            let configurationKey = parseInt(
                configurationsData.libraryPerDayCharges
            );
            let pipeLine = [
                {
                    $match: {
                        groupId: Number(groupId),
                        userId: Number(userId),
                        bookIssueLogId: Number(bookIssueLogId),
                        isReturn: false,
                    },
                },
                {
                    $project: {
                        groupId: 1,
                        userId: 1,
                        bookId: 1,
                        bookIssueLogId: 1,
                        isReturn: 1,
                        isOverdue: 1,
                        dueDate: 1,
                        issuedDate: 1,
                        overdueDays: {
                            $cond: {
                                if: { $gt: ["$$NOW", "$dueDate"] },
                                then: {
                                    $ceil: {
                                        $divide: [
                                            {
                                                $subtract: [
                                                    "$$NOW",
                                                    "$dueDate",
                                                ],
                                            },
                                            1000 * 60 * 60 * 24,
                                        ],
                                    },
                                },
                                else: 0,
                            },
                        },
                    },
                },
                {
                    $addFields: {
                        penalty: {
                            $multiply: ["$overdueDays", configurationKey],
                        },
                    },
                },
            ];

            let response = await bookIssueLogModel.aggregate(pipeLine).exec();
            let data = {
                data: response[0],
            };
            return data;
        } catch (error) {
            console.error("Error in getPenalty function:", error);
            throw error;
        }
    }

    async updateLibraryPaymentById(libraryPaymentId, groupId, newData) {
        try {
            const updateVendorData = await LibraryPaymentModel.findOneAndUpdate(
                { libraryPaymentId: libraryPaymentId, groupId: groupId },
                newData,
                { new: true }
            );
            return updateVendorData;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new LibraryPaymentService(
    LibraryPaymentModel,
    "librarypayment"
);
