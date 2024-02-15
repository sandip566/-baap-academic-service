const feesInstallmentModel = require("../schema/feesInstallment.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const Student = require("../schema/student.schema");
const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const studentAdmissionModel = require("../schema/studentAdmission.schema");
const courseModel = require("../schema/courses.schema");

class feesInstallmentService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getByInstallmentId(installmentId) {
        return this.execute(() => {
            return this.model.findOne({ installmentId: installmentId });
        });
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

    async updateUser(addmissionId, groupId, data) {
        try {
            const resp = await feesInstallmentModel.findOneAndUpdate(
                { addmissionId: addmissionId, groupId: groupId },

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

    // async updateFeesInstallmentById(installmentId, newData) {
    //     try {
    //         const updateFee = await feesInstallmentModel.findOneAndUpdate(
    //             { installmentId: installmentId},

    //             newData,
    //             { new: true }

    //         );
    //         console.log("updateFeeeeeeeeeeeeeeeeeeeeeeeeeeeee", updateFee);
    //         return updateFee;
    //     } catch (error) {
    //         throw error;
    //     }
    // }
    async updateFeesInstallmentById(installmentId, newFeesDetails, newData) {
        try {
            const updateResult = await feesInstallmentModel.findOneAndUpdate(
                { installmentId: installmentId },
                { feesDetails: newFeesDetails, ...newData },
                { new: true }
            );
            return updateResult;
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
            let installmentData = await this.getByInstallmentId(installmentId);
            console.log(installmentData.data);
            let Data = installmentData.data
            const result = await feesInstallmentModel.deleteOne({ installmentId: installmentId });

            if (result.deletedCount === 1) {
                return { success: true, data: Data, message: 'Student deleted successfully' };
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

    async getAllDataByGroupId(groupId) {
        try {
            const course = await courseModel.find({ groupId: groupId });
            return course;
        } catch (error) {
            throw error;
        }
    }

    async getTotalStudents(courseId) {
        try {
            const totalStudents = await studentAdmissionModel.countDocuments({ "courseDetails": { $elemMatch: { "course_id": courseId } } });
            return totalStudents;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getTotalFeesAndPendingFees(courseId, groupId, feesTemplateId, academicYear) {
        try {

            let fee = await feesInstallmentModel.aggregate([
                {
                    $match: {
                        "courseDetails.course_id": Number(courseId),
                        groupId: Number(groupId),
                        "feesDetail.feesTemplateId": Number(feesTemplateId),
                        academicYear: academicYear
                    }
                },
                {
                    $unwind: "$feesDetails"
                },
                {
                    $unwind: "$feesDetails.installment"
                },
                {
                    $group: {
                        _id: {
                            documentId: "$_id",
                            status: "$feesDetails.installment.status"
                        },
                        totalAmount: { $sum: { $toInt: "$feesDetails.installment.amount" } }
                    }
                },
                {
                    $group: {
                        _id: "$_id.documentId",
                        feesDetails: {
                            $push: {
                                status: "$_id.status",
                                totalAmount: "$totalAmount"
                            }
                        },
                        totalAmountAllStatus: { $sum: "$totalAmount" }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        feesDetails: 1,
                        totalAmountAllStatus: 1
                    }
                }
            ]);

            const response = {
                totalFees: 0,
                pendingFees: 0,
                paidFees: 0
            };

            if (fee.length > 0) {
                response.totalFees = fee[0].totalAmountAllStatus;
                fee[0].feesDetails.forEach(detail => {
                    if (detail.status === 'pending') {
                        response.pendingFees += detail.totalAmount;
                    } else if (detail.status === 'paid') {
                        response.paidFees += detail.totalAmount;
                    }
                });
            }

            return response;
        } catch (error) {
            throw error;
        }
    }

}
module.exports = new feesInstallmentService(feesInstallmentModel, "FeesInstallation");