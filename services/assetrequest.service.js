const AssetRequestModel = require("../schema/assetrequest.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class AssetRequestService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.name) query.name = new RegExp(criteria.name, "i");
        if (criteria.status) query.status = new RegExp(criteria.status, "i");
        if (criteria.type) query.type = new RegExp(criteria.type, "i");
        if (criteria.category) query.category = new RegExp(criteria.category, "i");
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteByDataId(requestId, groupId) {
        try {
            const deleteData = await AssetRequestModel.findOneAndDelete({
                requestId: requestId,
                groupId: groupId,
            });
            return {
                data: deleteData,
                message: "Data deleted successfully",
            };
        } catch (error) {
            throw error;
        }
    }

    async updateDataById(requestId, groupId, newData) {
        try {
            const updatedData = await AssetRequestModel.findOneAndUpdate(
                { requestId: requestId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async getByDataId(requestId) {
        return this.execute(() => {
            return AssetRequestModel.findOne({
                requestId: requestId,
            });
        });
    }
}

module.exports = new AssetRequestService(AssetRequestModel, 'assetrequest');
