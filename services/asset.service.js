const AssetModel = require("../schema/asset.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class AssetService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.assetId) query.assetId = criteria.assetId;
        if (criteria.assetName) query.assetName = new RegExp(criteria.assetName, "i");
        if (criteria.ModelName) query.ModelName = new RegExp(criteria.ModelName, "i");
        if (criteria.SerialNo) query.SerialNo = criteria.SerialNo;
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
