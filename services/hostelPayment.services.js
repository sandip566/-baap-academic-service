const hostelPaymentModel = require("../schema/hostelPayment.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class hostelPaymentService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllHostelPaymentByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        criteria.pageSize = 10;
        if (criteria.hostelPaymentId)
            query.hostelPaymentId = criteria.hostelPaymentId;
        if (criteria.studentId) query.studentId = criteria.studentId;
        if (criteria.memberId) query.memberId = criteria.memberId;
        if (criteria.hostelId) query.hostelId = criteria.hostelId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteHostelPaymentId(hostelPaymentId, groupId) {
        try {
            return await hostelPaymentModel.deleteOne(hostelPaymentId, groupId);
        } catch (error) {
            throw error;
        }
    }
    async updateHostelPaymentById(hostelPaymentId, groupId, newData) {
        try {
            const updateHostelPaymnet =
                await hostelPaymentModel.findOneAndUpdate(
                    { hostelPaymentId: hostelPaymentId, groupId: groupId },
                    newData,
                    { new: true }
                );
            return updateHostelPaymnet;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new hostelPaymentService(hostelPaymentModel, "hostelPayment");
