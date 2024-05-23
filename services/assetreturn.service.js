const AssetReturnModel = require("../schema/assetreturn.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class AssetReturnService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getByAssetTypeId(returnAssetId) {
        return this.execute(() => {
            return AssetReturnModel.findOne({
                returnAssetId: returnAssetId,
            });
        });
    }
    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.returnAssetId) query.returnAssetId = criteria.returnAssetId;
        if (criteria.name) query.name = new RegExp(criteria.name, "i");

        return this.preparePaginationAndReturnData(query, criteria);
    }
    async updateByAssetId(returnAssetId, groupId, newData) {
        try {
            const updatedData = await AssetReturnModel.findOneAndUpdate({ returnAssetId: returnAssetId, groupId: groupId }, newData, { new: true });
            return updatedData;
        } catch (error) {
            throw error;
        }
    }


    async deleteByAssetId(returnAssetId, groupId) {
        try {
            const deleteData = await AssetReturnModel.deleteOne({ returnAssetId: returnAssetId, groupId: groupId });
            return deleteData;
        } catch (error) {
            throw error;
        }
    }

}

module.exports = new AssetReturnService(AssetReturnModel, 'assetreturn');
