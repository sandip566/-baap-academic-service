const vehiclepaymenthistoryModel = require("../schema/vehiclepaymenthistory.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class vehiclepaymenthistoryervice extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

 async   getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.vehiclepaymenthistoryId) query.vehiclepaymenthistoryId = criteria.vehiclepaymenthistoryId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteTripHistroyById(vehiclepaymenthistoryId, groupId) {
        try {
            return await vehiclepaymenthistoryModel.deleteOne(
                vehiclepaymenthistoryId,
                groupId
            );
        } catch (error) {
            throw error;
        }
    }

    async updatevehiclepaymenthistoryById(vehiclepaymenthistoryId, groupId, newData) {
        try {
            const updatedVisitor = await vehiclepaymenthistoryModel.findOneAndUpdate(
                { vehiclepaymenthistoryId: vehiclepaymenthistoryId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedVisitor;
        } catch (error) {
            throw error;
        }
    }

   
}
module.exports = new vehiclepaymenthistoryervice(vehiclepaymenthistoryModel, "vehiclepaymenthistory");
