const AssignedAssetModel = require("../schema/assignedasset.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class AssignedAssetService extends BaseService {
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

    async deleteByDataId(assignedId, groupId) {
        try {
            const deleteData = await AssignedAssetModel.findOneAndDelete({
                assignedId: assignedId,
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

    async updateDataById(assignedId, groupId, newData) {
        try {
            const updatedData = await AssignedAssetModel.findOneAndUpdate(
                { assignedId: assignedId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async getByDataId(assignedId) {
        return this.execute(() => {
            return AssignedAssetModel.findOne({
                assignedId: assignedId,
            });
        });
    }
}

module.exports = new AssignedAssetService(AssignedAssetModel, 'assignedasset');
