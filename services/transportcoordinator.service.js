const transportcoordinatorModel = require("../schema/transportcoordinator.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class transportcoordinatorService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.transportcoordinatorId) query.transportcoordinatorId = criteria.transportcoordinatorId;
        if (criteria.transportcoordinatorName)
            query.transportcoordinatorName = new RegExp(criteria.transportcoordinatorName, "i");
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deletetransportcoordinator(vendorId, groupId) {
        try {
            return await this.dbModel.deleteOne({
                transportcoordinatorId: transportcoordinatorId,
                groupId: groupId,
            });
        } catch (error) {
            throw error;
        }
    }

    async updatetransportcoordinatorId(transportcoordinatorId, groupId, newData) {
        try {
            const updatedtransportcoordinator = await this.dbModel.findOneAndUpdate(
                { transportcoordinatorId: transportcoordinatorId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedtransportcoordinator;
        } catch (error) {
            throw error;
        }
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.transportcoordinatorId) query.transportcoordinatorId = criteria.transportcoordinatorId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteVendorById(transportcoordinatorId, groupId) {
        try {
            return await transportcoordinatorModel.deleteOne(transportcoordinatorId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updatetransportcoordinatorById(transportcoordinatorId, groupId, newData) {
        try {
            const updatetransportcoordinatorData = await transportcoordinatorModel.findOneAndUpdate(
                { transportcoordinatorId: transportcoordinatorId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatetransportcoordinatorData;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new transportcoordinatorService(transportcoordinatorModel, "transportcoordinator");
