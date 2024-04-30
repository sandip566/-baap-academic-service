const BaseService = require("@baapcompany/core-api/services/base.service");
const driverModel = require("../schema/driver.schema");

class Service extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getAllDataByGroupId(groupId, criteria, sortOptions) {
        try {
            const query = {
                groupId: groupId,
            };
    if (criteria && criteria.driverId) {
                query.driverId = criteria.driverId;
            }
            const data = await driverModel
                .find({ groupId: groupId })
                .sort(sortOptions);

            return data;
        } catch (error) {
            throw error;
        }
    }

    async deletedriverById(driverId, groupId) {
        try {
            return await driverModel.deleteOne({
                driverId: driverId,
                groupId: groupId,
            });
        } catch (error) {
            throw error;
        }
    }

    async updatedriverById(driverId, groupId, newData) {
        try {
            const updateData = await driverModel.findOneAndUpdate(
                { driverId: driverId, groupId: groupId },
                newData,
                { new: true }
            );
            return updateData;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new Service(driverModel, "driver");
