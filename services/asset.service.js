const AssetModel = require("../schema/asset.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const AssetRequestModel = require("../schema/assetrequest.schema");

class AssetService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getByDataId(assetId) {
        return this.execute(() => {
            return AssetModel.findOne({
                assetId: assetId,
            });
        });
    }

    async getAssetDashboard(groupId, criteria) {
        try {
            const query = {
                groupId: Number(groupId),
            };
            if (criteria.modelName) query.modelName = new RegExp(criteria.modelName, "i");

            const assets = await AssetModel.find(query);
            const assetIds = assets.map(asset => asset.assetId);

            const issuedCount = await AssetRequestModel.aggregate([
                { $match: { assetId: { $in: assetIds }, status: "Issued" } },
                { $group: { _id: null, totalIssued: { $sum: "$quantity" } } }
            ]);

            const totalIssued = issuedCount.length > 0 ? issuedCount[0].totalIssued : 0;
            const totalCurrentValue = assets.reduce((acc, asset) => acc + asset.currentValue, 0);
            const totalAvailable = assets.reduce((acc, asset) => acc + asset.available, 0);

            const result = {
                totalCurrentValue,
                totalAvailable,
                totalIssued
            };

            return {
                status: "Success",
                data: result
            };
        } catch (error) {
            console.error("Error in getAssetDashboard:", error);
            throw error;
        }
    }

    async getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: Number(groupId),
        };
        if (criteria.assetId) query.assetId = criteria.assetId;
        if (criteria.assetName) query.assetName = new RegExp(criteria.assetName, "i");
        if (criteria.modelName) query.modelName = new RegExp(criteria.modelName, "i");
        if (criteria.serialNo) query.serialNo = criteria.serialNo;
        if (criteria.location) query.location = criteria.location;
        if (criteria.status) query.status = criteria.status;
        if (criteria.assetType) query.assetType = criteria.assetType;

        const skip = (criteria.pageNumber - 1) * criteria.pageSize;
        const limit = criteria.pageSize;

        const aggregateQuery = [
            { $match: query },
            { $skip: skip },
            { $limit: limit }
        ];

        const asset = await AssetModel.aggregate(aggregateQuery).sort({ createdAt: -1 });
        const totalCount = await AssetModel.countDocuments(query);

        return {
            status: "Success",
            data: {
                items: asset,
                totalItemsCount: totalCount
            },
        };
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
