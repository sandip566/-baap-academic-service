const busModel = require("../schema/bus.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class buservice extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

 async   getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.busId) query.busId = criteria.busId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteTripHistroyById(busId, groupId) {
        try {
            return await busModel.deleteOne(
                busId,
                groupId
            );
        } catch (error) {
            throw error;
        }
    }

    async updatebusById(busId, groupId, newData) {
        try {
            const updatedVisitor = await busModel.findOneAndUpdate(
                { busId: busId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedVisitor;
        } catch (error) {
            throw error;
        }
    }

   
}
module.exports = new buservice(busModel, "bus");
