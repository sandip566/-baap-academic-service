const driverModel = require("../schema/driver.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class driverervice extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.driverId) query.driverId = criteria.driverId;
        if (criteria.phoneNumber) query.phoneNumber = criteria.phoneNumber;
        if (criteria.driverName) query.driverName = new RegExp(criteria.driverName, "i");
        if (criteria.search) {
            const searchRegex = new RegExp(criteria.search, "i");
            query.$or = [
                { driverName: searchRegex },
            ];
            const numericSearch = parseInt(criteria.search);
            if (!isNaN(numericSearch)) {
                query.$or.push({ phoneNumber: numericSearch });
            }
        }
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteTripHistroyById(driverId, groupId) {
        try {
            return await driverModel.deleteOne(
                driverId,
                groupId
            );
        } catch (error) {
            throw error;
        }
    }

    async updatedriverById(driverId, groupId, newData) {
        try {
            const updatedVisitor = await driverModel.findOneAndUpdate(
                { driverId: driverId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedVisitor;
        } catch (error) {
            throw error;
        }
    }


}
module.exports = new driverervice(driverModel, "driver");
