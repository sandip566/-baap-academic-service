const BedModel = require("../schema/bed.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class BedService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    // async getAllDataByGroupId(groupId, criteria) {
    //     const query = {
    //         groupId: Number(groupId),
    //     };
    //     if (criteria.status) query.status = criteria.status;
    //     if (criteria.numberOfBed)
    //         query.numberOfBed = parseInt(criteria.numberOfBed);
    //     if (criteria.name) query.name = new RegExp(criteria.name, "i");
    //     const totalItemsCount = await BedModel.countDocuments(query);
    //     const bed = await BedModel.aggregate([
    //         { $match: query },
    //         { $sort: { createdAt: -1 } },
    //     ]);
    //     return {
    //         status: "Success",
    //         data: {
    //             items: bed,
    //             totalItemsCount,
    //         },
    //     };
    // }



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


    // async  getAllDataByGroupId(groupID, criteria) {
    //     try {
    //         const groupId = parseInt(groupID);
    //         if (isNaN(groupId)) {
    //             throw new Error("Invalid groupID");
    //         }
    
    //         const searchFilter = { groupId };
    
    //         if (criteria.search) {
    //             const searchRegex = new RegExp(criteria.search.trim(), "i");
    //             searchFilter.$or = [
    //                 { bedId: { $eq: parseInt(criteria.search) } },
    //                 { status: searchRegex },
    //                 { description: searchRegex },
    //                 { numberOfBed: { $eq: parseInt(criteria.search) } },
    //             ];
    //         }
    
    //         const aggregationPipeline = [
    //             { $match: searchFilter },
    //             {
    //                 $facet: {
    //                     totalItemsCount: [{ $count: "count" }],
    //                     items: [
    //                         { $sort: { createdAt: -1 } }
    //                     ]
    //                 }
    //             },
    //             {
    //                 $project: {
    //                     items: 1,
    //                     totalItemsCount: { $arrayElemAt: ["$totalItemsCount.count", 0] }
    //                 }
    //             },
    //             { $skip: 0 }, // Placeholder $skip stage
    //             { $limit: 10 } // Placeholder $limit stage
    //         ];
    
    //         const page = parseInt(criteria.page) || 1;
    //         const limit = parseInt(criteria.limit) || 10;
    
    //         // Dynamically set $skip and $limit based on page and limit values
    //         if (page > 1) {
    //             aggregationPipeline.push({ $skip: (page - 1) * limit });
    //         }
    //         aggregationPipeline.push({ $limit: limit });
    
    //         const result = await BedModel.aggregate(aggregationPipeline);
    
    //         if (result.length === 0 || !result[0].hasOwnProperty('items')) {
    //             return {
    //                 status: "Success",
    //                 data: {
    //                     items: [],
    //                     totalItemsCount: 0,
    //                 },
    //             };
    //         }
    
    //         return {
    //             status: "Success",
    //             data: {
    //                 items: result[0].items,
    //                 totalItemsCount: result[0].totalItemsCount || 0,
    //             },
    //         };
    //     } catch (error) {
    //         console.error("Error in getAllDataByGroupId:", error);
    //         throw new Error("An error occurred while processing the request. Please try again later.");
    //     }
    // }
    



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
