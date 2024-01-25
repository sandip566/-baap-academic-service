const miscellaneousPaymentModel = require("../schema/miscellaneousPayment.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class miscellaneousPaymentService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllMiscellaneousPaymentByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.miscellaneousPaymentId) query.miscellaneousPaymentId = criteria.miscellaneousPaymentId;
        if (criteria.studentId) query.studentId = criteria.studentId;
        if (criteria.empId) query.empId = criteria.empId;
        if (criteria.installmentId) query.installmentId = criteria.installmentId;
        return this.preparePaginationAndReturnData(query, criteria)
    }

    async deleteMiscellaneousPaymentById(miscellaneousPaymentId, groupId) {
        try {
            return await miscellaneousPaymentModel.deleteOne(miscellaneousPaymentId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateMiscellaneousPaymentById(miscellaneousPaymentId, groupId, newData) {
        try {
            const updateMiscellaneousPaymentFee = await miscellaneousPaymentModel.findOneAndUpdate(
                { miscellaneousPaymentId: miscellaneousPaymentId, groupId: groupId },
                newData,
                { new: true }
            );
            return updateMiscellaneousPaymentFee;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new miscellaneousPaymentService(miscellaneousPaymentModel, "miscellaneousPayment");
