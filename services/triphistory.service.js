const triphistoryModel = require("../schema/triphistory.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class triphistoryervice extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async updatetriphistoryById(triphistoryId, groupId, newData) {
        try {
            const updatedData = await triphistoryModel.findOneAndUpdate(
                { triphistoryId: triphistoryId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async deleteBytriphistoryId(triphistoryId, groupId) {
        try {
            return await triphistoryModel.deleteOne(triphistoryId, groupId);
        } catch (error) {
            throw error;
        }
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.vendorId) query.vendorId = criteria.vendorId;
        if (criteria.triphistoryId)
            query.triphistoryId = criteria.triphistoryId;
        return this.preparePaginationAndReturnData(query, criteria);
    }
}
module.exports = new triphistoryervice(triphistoryModel, "triphistory");
