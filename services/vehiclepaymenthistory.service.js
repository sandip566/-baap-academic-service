const vehiclepaymenthistoryModel = require("../schema/vehiclepaymenthistory.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class vehiclepaymenthistoryService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getByDataId(vehiclepaymenthistoryId) {
        return this.execute(() => {
            return vehiclepaymenthistoryModel.findOne({
                vehiclepaymenthistoryId: vehiclepaymenthistoryId,
            });
        });
    }
    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.lateFeeAmount)
            query.lateFeeAmount = criteria.lateFeeAmount;
        if (criteria.paymentStatus)
            query.paymentStatus = new RegExp(criteria.paymentStatus, "i");
        if (criteria.vehiclepaymenthistoryId)
            query.vehiclepaymenthistoryId = criteria.vehiclepaymenthistoryId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async updateDataById(vehiclepaymenthistoryId, groupId, newData) {
        try {
            const updatedData = await vehiclepaymenthistoryModel.findOneAndUpdate(
                { vehiclepaymenthistoryId: vehiclepaymenthistoryId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async deleteByDataId(vehiclepaymenthistoryId, groupId) {
        try {
            const deleteData = await vehiclepaymenthistoryModel.deleteOne({
                vehiclepaymenthistoryId: vehiclepaymenthistoryId,
                groupId: groupId,
            });
            return deleteData;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new vehiclepaymenthistoryService(
    vehiclepaymenthistoryModel,
    "vehiclepaymenthistory"
);
