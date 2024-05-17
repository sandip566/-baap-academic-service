const TravellerModel = require("../schema/traveller.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class TravellerService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getBytravellerId(travellerId) {
        return this.execute(() => {
            return this.model.findOne({ travellerId: travellerId });
        });
    }

    async getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.travellerId) query.travellerId = criteria.travellerId;
        if (criteria.phoneNumber) query.phoneNumber = criteria.phoneNumber;
        if (criteria.travellerName) query.travellerName = new RegExp(criteria.travellerName, "i");
        if (criteria.search) {
            const searchRegex = new RegExp(criteria.search, "i");
            query.$or = [
                { travellerName: searchRegex },
            ];
            const numericSearch = parseInt(criteria.search);
            if (!isNaN(numericSearch)) {
                query.$or.push({ phoneNumber: numericSearch });
            }
        }
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteTravellerId(travellerId, groupId) {
        try {
            return await TravellerModel.deleteOne(
                travellerId,
                groupId
            );
        } catch (error) {
            throw error;
        }
    }

    async updatetravellerById(travellerId, groupId, newData) {
        try {
            const updatedVisitor = await TravellerModel.findOneAndUpdate(
                { travellerId: travellerId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedVisitor;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new TravellerService(TravellerModel, 'traveller');
