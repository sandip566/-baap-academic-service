const feesPaymentModel = require("../schema/feesPayment.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class feesPaymentService extends BaseService {
  constructor(dbModel, entityName) {
    super(dbModel, entityName);
  }

  getAllFeesPaymentByGroupId(groupId, criteria) {
    const query = {
      groupId: groupId,
    };
    if (criteria.feesPaymentId) query.feesPaymentId = criteria.feesPaymentId;
    if (criteria.memberId) query.memberId = criteria.memberId;
    if (criteria.installmentId) query.installmentId = criteria.installmentId;
    return this.preparePaginationAndReturnData(query, criteria)
  }

  async deleteFeesPaymentById(feesPaymentId, groupId) {
    try {
      return await feesPaymentModel.deleteOne(feesPaymentId, groupId);
    } catch (error) {
      throw error;
    }
  }

  async updateFeesPaymentById(feesPaymentId, groupId, newData) {
    try {
      const updateFeesPayment = await feesPaymentModel.findOneAndUpdate(
        { feesPaymentId: feesPaymentId, groupId: groupId },
        newData,
        { new: true }
      );
      return updateFeesPayment;
    } catch (error) {
      throw error;
    }
  }

  getAllFeesPaymentByStudentId(studentId, criteria) {
    const query = {
      studentId: studentId,
      // Add other criteria if needed
    };
    return this.preparePaginationAndReturnData(query, criteria);
  }
}
module.exports = new feesPaymentService(feesPaymentModel, "FeesPayment");