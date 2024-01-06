const studentAdmissionModel = require("../schema/studentAdmission.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class StudentsAddmisionService extends BaseService {
  constructor(dbModel, entityName) {
    super(dbModel, entityName);
  }

  async updateStudentsAddmisionById(studentAdmissionId, groupId, newData) {
    try {
      const updatedData = await this.dbModel.findOneAndUpdate(
        { studentAdmissionId: studentAdmissionId, groupId: groupId },
        newData,
        { new: true }
      );
      return updatedData;
    }
    catch (error) {
      throw error;
    }
  }

  async deleteByStudentsAddmisionId(studentAdmissionId, groupId) {
    try {
      return await this.dbModel.deleteOne({
        studentAdmissionId: studentAdmissionId,
        groupId: groupId,
      });
    }
    catch (error) {
      throw error;
    }
  }

  getAllDataByGroupId(groupId, criteria) {
    const query = {
      groupId: groupId,
    };
    if (criteria.studentAdmissionId) query.studentAdmissionId = criteria.studentAdmissionId;
    return this.preparePaginationAndReturnData(query, criteria);
  }
}
module.exports = new StudentsAddmisionService(studentAdmissionModel, 'studentAdmission');
