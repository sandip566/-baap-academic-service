const AssetTypesModel = require("../schema/assettypes.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class AssetTypesService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getByAssetTypeId(assetTypeId) {
        return this.execute(() => {
            return AssetTypesModel.findOne({
                assetTypeId: assetTypeId,
            });
        });
    }
    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.assetTypeId) query.assetTypeId = criteria.assetTypeId;
        if (criteria.name) query.name = new RegExp(criteria.name, "i");

        return this.preparePaginationAndReturnData(query, criteria);
    }
    async updateByAssetId(assetTypeId, groupId, newData) {
        try {
            const updatedData = await AssetTypesModel.findOneAndUpdate({ assetTypeId: assetTypeId, groupId: groupId }, newData, { new: true });
            return updatedData;
        } catch (error) {
            throw error;
        }
    }


    async deleteByAssetId(assetTypeId, groupId) {
        try {
            const deleteData = await AssetTypesModel.deleteOne({ assetTypeId: assetTypeId, groupId: groupId });
            return deleteData;
        } catch (error) {
            throw error;
        }
    }

}

module.exports = new AssetTypesService(AssetTypesModel, "assettypes");
