const transportcoordinatorModel = require("../schema/transportcoordinator.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class transportcoordinatorervice extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getBytransportCoordinatorId(transportCoordinatorId) {
        return this.execute(() => {
            return this.model.findOne({ transportCoordinatorId: transportCoordinatorId });
        });
    }

    async   getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.transportCoordinatorId) query.transportCoordinatorId = criteria.transportCoordinatorId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deletetransportcoordinatorById(transportCoordinatorId, groupId) {
        try {
            return await transportcoordinatorModel.deleteOne(
                transportCoordinatorId,
                groupId
            );
        } catch (error) {
            throw error;
        }
    }

    async updateTransportCoordinatorById(transportCoordinatorId, groupId, newData) {
        try {
            const updatedVisitor = await transportcoordinatorModel.findOneAndUpdate(
                { transportCoordinatorId: transportCoordinatorId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedVisitor;
        } catch (error) {
            throw error;
        }
    }

   
}
module.exports = new transportcoordinatorervice(transportcoordinatorModel, "transportcoordinator");
