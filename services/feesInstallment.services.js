const feesInstallmentModel = require("../schema/feesInstallment.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const Student = require("../schema/student.schema");
const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");

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
        if (criteria.empId) query.empId = criteria.empId;
        if (criteria.installmentNo) query.installmentNo = criteria.installmentNo;
        return this.preparePaginationAndReturnData(query, criteria,);
    }
    async updateUser(addmissionId, data) {
        try {
            const resp = await feesInstallmentModel.findOneAndUpdate(
                { addmissionId: addmissionId },

                data,
                { upsert: true, new: true }
            );

            return new ServiceResponse({
                data: resp,
            });
        } catch (error) {
            return new ServiceResponse({
                isError: true,
                message: error.message,
            });
        }
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
    async getByInstallmentId(installmentId) {
        return this.execute(() => {
            return this.model.findOne({ installmentId: installmentId });
        });
    }
    async getInstallmentsByStudentId(studentId) {
        try {

            const installments = await feesInstallmentModel.find({ studentId: studentId });
            return installments;
        } catch (error) {
            throw error;
        }
    }
    async deleteStudentById(installmentId) {
        try {
            let installmentData=await this.getByInstallmentId(installmentId);
            console.log(installmentData.data);
            let Data=installmentData.data
            const result = await feesInstallmentModel.deleteOne({ installmentId: installmentId });
    
            if (result.deletedCount === 1) {
                return { success: true,data:Data, message: 'Student deleted successfully' };
            } else {
                return { success: false, message: 'Student not found' };
            }
        } catch (error) {
            throw error;
        }
    }
    
    async updateInstallmentAsPaid(installmentId) {
        try {
            const updateResult = await feesInstallmentModel.findOneAndUpdate(
                { _id: installmentId },
                { $set: { isPaid: true, status: "paid" } },
                { new: true }
            );
            return updateResult;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new feesInstallmentService(feesInstallmentModel, "FeesInstallation");