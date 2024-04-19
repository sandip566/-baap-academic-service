const LatefeepaymentModel = require("../schema/latefeepayment.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class LatefeepaymentService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getByDataId(lateFeePaymentId) {
        return this.execute(() => {
            return LatefeepaymentModel.findOne({
                lateFeePaymentId: lateFeePaymentId,
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
        if (criteria.lateFeePaymentId)
            query.lateFeePaymentId = criteria.lateFeePaymentId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async updateDataById(lateFeePaymentId, groupId, newData) {
        try {
            const updatedData = await LatefeepaymentModel.findOneAndUpdate(
                { lateFeePaymentId: lateFeePaymentId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async deleteByDataId(lateFeePaymentId, groupId) {
        try {
            const deleteData = await LatefeepaymentModel.deleteOne({
                lateFeePaymentId: lateFeePaymentId,
                groupId: groupId,
            });
            return deleteData;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new LatefeepaymentService(
    LatefeepaymentModel,
    "latefeepayment"
);
