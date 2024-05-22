const ActiveTripsModel = require("../schema/activetrips.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class ActiveTripsService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getBytripId(tripId) {
        return this.execute(() => {
            return this.model.findOne({ tripId: tripId });
        });
    }

    async getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.tripId) query.tripId = criteria.tripId;
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

    async deleteTripHistroyById(tripId, groupId) {
        try {
            return await ActiveTripsModel.deleteOne(
                tripId,
                groupId
            );
        } catch (error) {
            throw error;
        }
    }

    async updatedriverById(tripId, groupId, newData) {
        try {
            const updatedVisitor = await ActiveTripsModel.findOneAndUpdate(
                { tripId: tripId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedVisitor;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ActiveTripsService(ActiveTripsModel, 'activetrips');
