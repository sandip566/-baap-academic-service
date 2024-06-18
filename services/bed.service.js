const BedModel = require("../schema/bed.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class BedService extends BaseService {
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
    
            if (criteria.search) {
                const searchRegex = new RegExp(criteria.search.trim(), "i");
                searchFilter.$or = [
                    { bedId: { $eq: parseInt(criteria.search) } },
                    { status: searchRegex },
                    { description: searchRegex },
                    { numberOfBed: { $eq: parseInt(criteria.search) } },
                    
                ];
            }
            const page = parseInt(criteria.page) || 1;
            const limit = parseInt(criteria.limit) || 10;
    
            const aggregationPipeline = [
                { $match: searchFilter },
                {
                    $facet: {
                        totalItemsCount: [{ $count: "count" }],
                        items: [
                            { $sort: { createdAt: -1 } },
                            { $skip: (page - 1) * limit },
                            { $limit: limit }
                        ]
                    }
                },
                {
                    $project: {
                        items: 1,
                        totalItemsCount: { $arrayElemAt: ["$totalItemsCount.count", 0] }
                    }
                }
            ];
            
    
            const result = await BedModel.aggregate(aggregationPipeline);
    
            return {
                status: "Success",
                data: {
                    items: result[0].items,
                    totalItemsCount: result[0].totalItemsCount || 0,
                },
            };
        } catch (error) {
            console.error("Error in getAllDataByGroupId:", error);
            throw new Error("An error occurred while processing the request. Please try again later.");
        }
    }

    async deleteByDataId(groupId, bedId) {
        try {
            const deleteData = await BedModel.deleteOne({
                groupId: groupId,
                bedId: bedId,
            });
            console.log(deleteData);
            return deleteData;
        } catch (error) {
            throw error;
        }
    }
    async updateDataById(bedId, groupId, newData) {
        try {
            const updateData = await BedModel.findOneAndUpdate(
                { bedId: bedId, groupId: groupId },
                newData,
                { new: true }
            );
            return updateData;
        } catch (error) {
            throw error;
        }
    }
    async getByBedId(bedId) {
        return this.execute(() => {
            return BedModel.findOne({
                bedId: bedId,
            });
        });
    }
}

module.exports = new BedService(BedModel, "bed");
