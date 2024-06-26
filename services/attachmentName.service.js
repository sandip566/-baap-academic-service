const AttachmentNameModel = require("../schema/attachmentname.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class AttachmentNameService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async findByName(name) {
        try {
            return await AttachmentNameModel.findOne({ name: name });
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

            if (criteria.search) {
                const searchRegex = new RegExp(criteria.search.trim(), "i");
                aggregationPipeline.push({
                    $match: {
                        $or: [
                            { name: searchRegex },
                            { attachmentId: { $eq: parseInt(criteria.search) } },
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

            const AttacmentData = await AttachmentNameModel.aggregate(
                aggregationPipeline
            );
            const totalCount = await AttachmentNameModel.countDocuments(searchFilter);
            

            return {
                status: "Success",
                data: {
                    items: AttacmentData,
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



    async deleteAttachmentById(attachmentId, groupId) {
        try {
            return await AttachmentNameModel.deleteOne(attachmentId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateAttachmentById(attachmentId, groupId, newData) {
        try {
            const updateManageExamTerm = await AttachmentNameModel.findOneAndUpdate(
                { attachmentId: attachmentId, groupId: groupId },
                newData,
                { new: true }
            );
            return updateManageExamTerm;
        } catch (error) {
            throw error;
        }
    }




}

module.exports = new AttachmentNameService(AttachmentNameModel, 'attachmentname');
