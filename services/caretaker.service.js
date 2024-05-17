const CareTakerModel = require("../schema/caretaker.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class CareTakerService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.careTakerId) query.careTakerId = criteria.careTakerId;
        if (criteria.phoneNumber) query.phoneNumber = criteria.phoneNumber;
        if (criteria.name) query.name = new RegExp(criteria.name, "i");
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

    async deleteTripHistroyById(careTakerId, groupId) {
        try {
            return await CareTakerModel.deleteOne(
                careTakerId,
                groupId
            );
        } catch (error) {
            throw error;
        }
    }

    async updatedriverById(careTakerId, groupId, newData) {
        try {
            const updatedVisitor = await CareTakerModel.findOneAndUpdate(
                { careTakerId: careTakerId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedVisitor;
        } catch (error) {
            throw error;
        }
    }

}

module.exports = new CareTakerService(CareTakerModel, 'caretaker');
