const ManageGradePatternModel = require("../schema/manageGradePattern.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class ManageGradePatternService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async findByName(groupId, name) {
        try {
            const result = await ManageGradePatternModel.aggregate([
                { $match: { groupId: groupId, name: name } },
                { $limit: 1 }
            ]);

            return result.length > 0 ? result[0] : null;
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
            ];
            const combinedFilter = [];
            if (criteria.search) {
                const searchCriteria = criteria.search.split(",");
                combinedFilter.push({
                    $or: searchCriteria.map(term => ({
                        $or: [
                            { gradePatternId: { $eq: parseInt(term) } },
                            { academicYearId: { $eq: parseInt(term) } },
                        ]
                    }))
                });
            }

            if (criteria.gradePatternId) {
                combinedFilter.push({ gradePatternId: parseInt(criteria.gradePatternId) });
            }

            if (combinedFilter.length > 0) {
                aggregationPipeline.push({ $match: { $and: combinedFilter } });
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

            const manageGradePatternData = await ManageGradePatternModel.aggregate(
                aggregationPipeline
            );
            const totalCount = await ManageGradePatternModel.countDocuments(searchFilter);


            return {
                status: "Success",
                data: {
                    items: manageGradePatternData,
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

    async deleteManageGradePatternById(gradePatternIds, groupId) {
        try {
            return await ManageGradePatternModel.deleteMany({
                groupId: groupId,
                gradePatternId: { $in: gradePatternIds },
            });
        } catch (error) {
            throw error;
        }
    }

    async updateManageGradePatternById(gradePatternId, groupId, newData) {
        try {
            const updateManageGradePattern = await ManageGradePatternModel.findOneAndUpdate(
                { gradePatternId: gradePatternId, groupId: groupId },
                newData,
                { new: true }
            );
            return updateManageGradePattern;
        } catch (error) {
            throw error;
        }
    }




}

module.exports = new ManageGradePatternService(ManageGradePatternModel, 'managegradepattern');
