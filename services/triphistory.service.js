const triphistoryModel = require("../schema/triphistory.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class triphistoryervice extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.tripHistoryId) query.tripHistoryId = criteria.tripHistoryId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteTripHistroyById(tripHistoryId, groupId) {
        try {
            return await triphistoryModel.deleteOne(
                tripHistoryId,
                groupId
            );
        } catch (error) {
            throw error;
        }
    }

    async updateTripHistoryById(tripHistoryId, groupId, newData) {
        try {
            const updatedVisitor = await triphistoryModel.findOneAndUpdate(
                { tripHistoryId: tripHistoryId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedVisitor;
        } catch (error) {
            throw error;
        }
    }


}
module.exports = new triphistoryervice(triphistoryModel, "triphistory");
