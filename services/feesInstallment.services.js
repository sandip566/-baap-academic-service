const feesInstallmentModel = require("../schema/feesInstallment.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const Student = require("../schema/student.schema")
class feesInstallmentService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getAllFeesInstallmentByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.studentId) query.studentId = criteria.studentId;
        if (criteria.installmentId) query.installmentId = criteria.installmentId;
        if (criteria.memberId) query.memberId = criteria.memberId;
        if(criteria.installmentNo)query.installmentNo=criteria.installmentNo

        return this.preparePaginationAndReturnData(query, criteria,);
    }

    async deleteFeesInstallmentById(installmentId, groupId) {
        try {
            return await feesInstallmentModel.deleteOne(installmentId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateFeesInstallmentById(installmentId, groupId, newData) {
        try {
            const updateFee = await feesInstallmentModel.findOneAndUpdate(
                { installmentId: installmentId, groupId: groupId },
                newData,
                { new: true }
            );
            return updateFee;
        } catch (error) {
            throw error;
        }
    }

    async getStudentById(studentId) {
        try {
            const student = await Student.findOne({ _id: studentId });
            return student;
        } catch (error) {
            throw error;
        }
    }
    async getInstallmentsByStudentId(studentId) {
        try {
            const installments = await feesInstallmentModel.find({ studentId: studentId });
            return installments;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new feesInstallmentService(feesInstallmentModel, "FeesInstallation");