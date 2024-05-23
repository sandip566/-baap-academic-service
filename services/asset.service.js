const AssetModel = require("../schema/asset.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class AssetService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getByAssetTypeId(assetId) {
        return this.execute(() => {
            return AssetReturnModel.findOne({
                returnAssetId: returnAssetId,
            });
        });
    }
    async getAssetDashboard(groupId, criteria) {
        try {
            const query = {
                groupId:Number(groupId),
            };
            console.log(query);
    
            if (criteria.modelName) query.modelName = new RegExp(criteria.modelName, "i");
    
            const result = await AssetModel.aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: "assetrequests",
                        localField: "assetId",
                        foreignField: "assetId",
                        as: "assetRequests"
                    }
                },
                { $unwind: "$assetRequests" },
                {
                    $group: {
                        _id: null,
                        totalCurrentValue: { $sum: "$currentValue" },
                        totalAvailable: { $sum: "$available" },
                        totalReturnQuantity: { $sum: "$assetRequests.returnQuantity" }
                    }
                },
                {
                    $addFields: {
                        totalIssued: { $subtract: ["$totalCurrentValue", "$totalAvailable"] }
                    }
                }
            ]).exec()
            console.log(result);
    let response={
        data:result
    }
            return response;
        } catch (error) {
            console.error("Error in getAssetDashboard:", error);
            throw error; // Rethrow the error to be caught by the calling function
        }
    }
    
    
    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.assetId) query.assetId = criteria.assetId;
        if (criteria.assetName) query.assetName = new RegExp(criteria.assetName, "i");
        if (criteria.modelName) query.modelName = new RegExp(criteria.modelName, "i");
        if (criteria.serialNo) query.serialNo = criteria.serialNo;
        if (criteria.location) query.location = criteria.location;
        if (criteria.status) query.status = criteria.status;
        if (criteria.assetType) query.assetType = criteria.assetType;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async updateByAssetId(assetId, groupId, newData) {
        try {
            const updatedData = await AssetModel.findOneAndUpdate({ assetId: assetId, groupId: groupId }, newData, { new: true });
            return updatedData;
        } catch (error) {
            throw error;
        }
    }


    async deleteByAssetId(assetId, groupId) {
        try {
            const deleteData = await AssetModel.deleteOne({ assetId: assetId, groupId: groupId });
            return deleteData;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new AssetService(AssetModel, 'asset');
