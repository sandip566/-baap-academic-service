const ManageExamTermModel = require("../schema/manageExamTerm.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class ManageExamTermService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
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
                {
                    $lookup:{
                        from:"termtypes",
                        localField:"termTypeId",
                        foreignField:"termTypeId" ,
                        as:"termTypeData"           
                    },
                },
                {
                    $unwind: {
                        path: "$termTypeData",
                        preserveNullAndEmptyArrays: true,
                    },
                },
            ];

            if (criteria.search) {
                const searchRegex = new RegExp(criteria.search.trim(), "i");
                aggregationPipeline.push({
                    $match: {
                        $or: [
                            { "item.name": searchRegex },
                            { "classData.name": searchRegex },
                            { manageExamTermId: { $eq: parseInt(criteria.search) } },
                            {"termTypeData.name": searchRegex },
                            {"item.priority": { $eq: parseInt(criteria.search) } },
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

            const manageExamData = await ManageExamTermModel.aggregate(
                aggregationPipeline
            );
            const totalCount = await ManageExamTermModel.countDocuments(searchFilter);
            

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



    async deleteManageExamTermById(manageExamTermId, groupId) {
        try {
            return await ManageExamTermModel.deleteOne(manageExamTermId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateManageExamTermById(manageExamTermId, groupId, newData) {
        try {
            const updateManageExamTerm = await ManageExamTermModel.findOneAndUpdate(
                { manageExamTermId: manageExamTermId, groupId: groupId },
                newData,
                { new: true }
            );
            return updateManageExamTerm;
        } catch (error) {
            throw error;
        }
    }

}

module.exports = new ManageExamTermService(ManageExamTermModel, 'manageexamterm');
