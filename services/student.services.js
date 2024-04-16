const BaseService = require("@baapcompany/core-api/services/base.service");
const studentModel = require("../schema/student.schema");

class Service extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getAllDataByGroupId(groupId, criteria, sortOptions) {
        try {
            const query = {
                groupId: groupId,
            };
            if (criteria && criteria.studentId) {
                query.studentId = criteria.studentId;
            }
            const data = await studentModel
                .find({ groupId: groupId })
                .sort(sortOptions);
            // return this.preparePaginationAndReturnData(data, criteria);
            return data;
        } catch (error) {
            throw error;
        }
    }

    async deleteStudentById(studentId, groupId) {
        try {
            return await studentModel.deleteOne({
                studentId: studentId,
                groupId: groupId,
            });
        } catch (error) {
            throw error;
        }
    }

    async updateStudentById(studentId, groupId, newData) {
        try {
            const updateData = await studentModel.findOneAndUpdate(
                { studentId: studentId, groupId: groupId },
                newData,
                { new: true }
            );
            return updateData;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new Service(studentModel, "student");
