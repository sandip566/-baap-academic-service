const feesPaymentModel = require("../schema/feesPayment.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class feesPaymentService extends BaseService {
  constructor(dbModel, entityName) {
    super(dbModel, entityName);
  }
  async getRecoveryData(groupId) {
    return this.execute(async () => {
        let data = await this.model.find({ groupId: groupId });
        const totalPaidAmount = data.reduce((total, item) => {
            if (item.paidAmount) {
                total += parseFloat(item.paidAmount);
            }
            return total;
        }, 0);

        const totalRemainingAmount = data.reduce((total, item) => {
          if (item.remainingAmount) {
              total += parseFloat(item.remainingAmount);
          }
          return total;
      }, 0);

        console.log("Total Paid Amount:", totalRemainingAmount);
        let response={
          totalPaidAmount:totalPaidAmount,
          totalRemainingAmount:totalRemainingAmount

        }
        return response; 
    });
}

  getAllFeesPaymentByGroupId(groupId, criteria) {
    const query = {
      groupId: groupId,
    };
    if (criteria.feesPaymentId) query.feesPaymentId = criteria.feesPaymentId;
    if (criteria.empId) query.empId = criteria.empId;
    if (criteria.userId) query.userId = criteria.userId;
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
    };
    return this.preparePaginationAndReturnData(query, criteria);
  }
}
module.exports = new feesPaymentService(feesPaymentModel, "FeesPayment");