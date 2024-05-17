const vehicleModel = require("../schema/vehicle.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class vehicleervice extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getByvehicleId(vehicleId) {
        return this.execute(() => {
            return this.model.findOne({ vehicleId: vehicleId });
        });
    }

    async getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.vehicleId) query.vehicleId = criteria.vehicleId;
        if (criteria.vehicleNumber) query.vehicleNumber = criteria.vehicleNumber;
        if (criteria.vehicleName) query.vehicleName = new RegExp(criteria.vehicleName, "i");
        if (criteria.search) {
            const searchRegex = new RegExp(criteria.search, "i");
            query.$or = [
                { vehicleName: searchRegex },
            ];
            const numericSearch = parseInt(criteria.search);
            if (!isNaN(numericSearch)) {
                query.$or.push({ vehicleNumber: numericSearch });
            }
        }
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
