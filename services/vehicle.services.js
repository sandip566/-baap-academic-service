const vehicleModel = require("../schema/vehicle.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class vehicleervice extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

 async   getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.vehicleId) query.vehicleId = criteria.vehicleId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteTripHistroyById(vehicleId, groupId) {
        try {
            return await vehicleModel.deleteOne(
                vehicleId,
                groupId
            );
        } catch (error) {
            throw error;
        }
    }

    async updatevehicleById(vehicleId, groupId, newData) {
        try {
            const updatedVisitor = await vehicleModel.findOneAndUpdate(
                { vehicleId: vehicleId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedVisitor;
        } catch (error) {
            throw error;
        }
    }

   
}
module.exports = new vehicleervice(vehicleModel, "vehicle");
