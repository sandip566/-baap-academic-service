const transportcoordinatorModel = require("../schema/transportcoordinator.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class transportcoordinatorervice extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

 async   getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.transportcoordinatorId) query.transportcoordinatorId = criteria.transportcoordinatorId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteTripHistroyById(transportcoordinatorId, groupId) {
        try {
            return await transportcoordinatorModel.deleteOne({
                transportcoordinatorId: transportcoordinatorId,
                groupId: groupId,
            });
        } catch (error) {
            throw error;
        }
    }

    async updatetransportcoordinatorById(transportcoordinatorId, groupId, newData) {
        try {
            const updatedVisitor = await transportcoordinatorModel.findOneAndUpdate(
                { transportcoordinatorId: transportcoordinatorId, groupId: groupId },
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
