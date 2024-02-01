const feesPaymentModel = require("../schema/feesPayment.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const StudentsAdmissionModel = require("../schema/studentAdmission.schema");

class feesPaymentService extends BaseService {
  constructor(dbModel, entityName) {
    super(dbModel, entityName);
  }


async getByfeesPaymentId(groupId, feesPaymentId) {
    return this.execute(async () => {
    let feesdata={}
        const feesPaymentData = await this.model.findOne({ groupId: groupId, feesPaymentId: feesPaymentId });
console.log("feesPaymentData",feesPaymentData);
        if (feesPaymentData) {
            const addmissionId = feesPaymentData.addmissionId;
            if (addmissionId) {
                const addmissionId1 = await StudentsAdmissionModel.findOne({ addmissionId: addmissionId });
feesdata.addmissionId=addmissionId1
                return { ...feesPaymentData._doc, ...feesdata };
            }
        }
        return null;
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