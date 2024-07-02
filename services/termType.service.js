const TermTypeModel = require("../schema/termType.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class TermTypeService extends BaseService {
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
            ];

            if (criteria.search) {
                aggregationPipeline.push({
                    $match: {
                        $or: [
                            { termTypeId: { $eq: parseInt(criteria.search) } },
                            {name:searchRegex},
                            {
                                academicYearId: {
                                    $eq: parseInt(criteria.search),
                                },
                            },
                        ],
                    },
                });
            }

            if (criteria.termTypeId) {
                aggregationPipeline.push({
                    $match: { termTypeId: parseInt(criteria.termTypeId) },
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

            const termTypeData = await TermTypeModel.aggregate(
                aggregationPipeline
            );
            const totalCount = await TermTypeModel.countDocuments(searchFilter);
            

            return {
                status: "Success",
                data: {
                    items: termTypeData,
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


    async deleteTermTypeById(termTypeId, groupId) {
        try {
            return await TermTypeModel.deleteOne(termTypeId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateTermTypeById(termTypeId, groupId, newData) {
        try {
            const updateManageGradePattern = await TermTypeModel.findOneAndUpdate(
                { termTypeId: termTypeId, groupId: groupId },
                newData,
                { new: true }
            );
            return updateManageGradePattern;
        } catch (error) {
            throw error;
        }
    }

}

module.exports = new TermTypeService(TermTypeModel, 'termtype');
