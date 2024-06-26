const MarksheetNameModel = require("../schema/marksheetName.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class MarksheetNameService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async findByName(groupId,name) {
        try {
            return await MarksheetNameModel.findOne({groupId:groupId, name: name });
        } catch (error) {
            console.error("Error in findByName:", error);
            throw error;
        }
    }

    async getAllDataByGroupId(groupID, criteria) {
        try {
            const groupId = parseInt(groupID);
            if (isNaN(groupId)) {
                throw new Error("Invalid groupID");
            }
            const searchFilter = { groupId };
            const aggregationPipeline = [
                { $match: searchFilter },
                {
                    $lookup: {
                        from: "classes",
                        localField: "classId",
                        foreignField: "classId",
                        as: "classData",
                    },
                },
                {
                    $unwind: {
                        path: "$classData",
                        preserveNullAndEmptyArrays: true,
                    },
                },
            ];

            if (criteria.search) {
                const searchRegex = new RegExp(criteria.search.trim(), "i");
                aggregationPipeline.push({
                    $match: {
                        $or: [
                            { name: searchRegex },
                            { markSheetId: { $eq: parseInt(criteria.search) } },
                            { "classData.name": searchRegex },
                            {
                                academicYearId: {
                                    $eq: parseInt(criteria.search),
                                },
                            },
                        ],
                    },
                });
            }

            if (criteria.userId) {
                aggregationPipeline.push({
                    $match: { userId: parseInt(criteria.userId) },
                });
            }
            const pageNumber = parseInt(criteria.pageNumber) || 1;
            const pageSize = parseInt(criteria.pageSize) || 10;
            aggregationPipeline.push({
                $sort: { _id: -1 },
            });

            aggregationPipeline.push(
                { $skip: (pageNumber - 1) * pageSize },
                { $limit: pageSize }
            );

            const manageExamData = await MarksheetNameModel.aggregate(
                aggregationPipeline
            );
            const totalCount = await MarksheetNameModel.countDocuments(searchFilter);
            

            return {
                status: "Success",
                data: {
                    items: manageExamData,
                },
            
                totalCount,
            };
        } catch (error) {
            console.error("Error in getAllDataByGroupId:", error);
            throw new Error(
                "An error occurred while processing the request. Please try again later."
            );
        }
    }
    async deleteMarksheetById(markSheetId, groupId) {
        try {
            return await MarksheetNameModel.deleteOne(markSheetId, groupId);
        } catch (error) {
            throw error;
        }
    }
    async updateMarksheetById(markSheetId, groupId, newData) {
        try {
            const updateMarksheet = await MarksheetNameModel.findOneAndUpdate(
                { markSheetId: markSheetId, groupId: groupId },
                newData,
                { new: true }
            );
            return updateMarksheet;
        } catch (error) {
            throw error;
        }
    }



}

module.exports = new MarksheetNameService(MarksheetNameModel, 'marksheetname');
