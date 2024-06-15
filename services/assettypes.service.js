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

    async getAllDataByGroupId(groupId, criteria) {
        const pageNumber = criteria.pageNumber;
        const pageSize = criteria.pageSize;
        const query = {
            groupId: Number(groupId),
        };
        if (criteria.assetTypeId) query.assetTypeId = criteria.assetTypeId;
        if (criteria.name) query.name = new RegExp(criteria.name, "i");

        const totalItemsCount = await AssetTypesModel.countDocuments(query)
        const assetTypes = await AssetTypesModel.aggregate([
            { $match: query },
            { $sort: { createdAt: -1 } },
            { $skip: (pageNumber - 1) * pageSize },
            { $limit: pageSize }
        ])

        return {
            status: "Success",
            data: {
                items: assetTypes,
                totalItemsCount,
            },
        }
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
