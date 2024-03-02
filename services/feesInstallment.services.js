const feesInstallmentModel = require("../schema/feesInstallment.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const Student = require("../schema/student.schema");
const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const studentAdmissionModel = require("../schema/studentAdmission.schema");
const courseModel = require("../schema/courses.schema");
const ClassModel = require("../schema/classes.schema");

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

        criteria.pageSize = 10
        if (criteria.studentId) query.studentId = criteria.studentId;
        if (criteria.installmentId) query.installmentId = criteria.installmentId;
        if (criteria.empId) query.empId = criteria.empId;
        if (criteria.installmentNo) query.installmentNo = criteria.installmentNo;
        return this.preparePaginationAndReturnData(query, criteria);
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
    async  updateInstallmentAmount(installmentId, newAmount) {
        console.log(installmentId, newAmount);
        try {
            const updateResult = await feesInstallmentModel.findOneAndUpdate(
                { "feesDetails.installment.installmentNo": installmentId },
                { $set: { "feesDetails.$[outer].installment.$[inner].amount": newAmount } },
                { arrayFilters: [{ "outer.installment.installmentNo": installmentId }, { "inner.installmentNo": installmentId }], multi: true, new: true }
            );
    
            console.log("Installment amount updated successfully:", updateResult);
        } catch (error) {
            console.error("Error updating installment amount:", error);
        }
    }
    
    // Example usage:
    // await updateInstallmentAmount(installmentIdToUpdate, newAmount);
    
    
    
    
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

    // async getTotalFeesAndPendingFees( groupId, feesTemplateId, academicYear) {
    //     // console.log("courseId, groupId, feesTemplateId, academicYear", groupId, feesTemplateId, academicYear);
    //     try {
    //         let fee = await feesInstallmentModel.aggregate([
    //             {
    //                 $match: {
    //                     // "courseDetails.course_id": Number(courseId),
    //                     "groupId": Number(groupId),
    //                     "feesDetails.feesTemplateId": Number(feesTemplateId),
    //                     "academicYear": Number(academicYear)
    //                 }
    //             },
    //             {
    //                 $unwind: "$feesDetails"
    //             },
    //             {
    //                 $unwind: "$feesDetails.installment"
    //             },
    //             {
    //                 $group: {
    //                     _id: {
    //                         documentId: "$_id",
    //                         status: "$feesDetails.installment.status"
    //                     },
    //                     totalAmount: { $sum: "$feesDetails.installment.amount" }
    //                 }
    //             },
    //             {
    //                 $group: {
    //                     _id: "$_id.documentId",
    //                     feesDetails: {
    //                         $push: {
    //                             status: "$_id.status",
    //                             totalAmount: "$totalAmount"
    //                         }
    //                     },
    //                     totalAmountAllStatus: { $sum: "$totalAmount" }
    //                 }
    //             },
    //             {
    //                 $project: {
    //                     _id: 1,
    //                     feesDetails: 1,
    //                     totalAmountAllStatus: 1
    //                 }
    //             }
    //         ]);

    //         const response = {
    //             totalFees: 0,
    //             pendingFees: 0,
    //             paidFees: 0
    //         };
           
    //         if (fee.length > 0) {
               
    //             response.totalFees = fee[0].totalAmountAllStatus;
    //             fee[0].feesDetails.forEach(detail => {
    //                 if (detail.status === 'pending') {
    //                     response.pendingFees += detail.totalAmount;
    //                 } else if (detail.status === 'paid') {
    //                     response.paidFees += detail.totalAmount;
    //                 }
    //             });
    //         }

    //         return response;
    //     } catch (error) {
    //         throw error;
    //     }
    // }
    async  getTotalFeesAndPendingFees(groupId = null, feesTemplateId = null, academicYear = null) {
        console.log(groupId = null, feesTemplateId = null, academicYear = null);
        try {
            const matchCriteria = {};
    
            if (groupId !== null) matchCriteria["groupId"] = Number(groupId);
            if (feesTemplateId !== null) matchCriteria["feesDetails.feesTemplateId"] = Number(feesTemplateId);
            if (academicYear !== null) matchCriteria["academicYear"] = Number(academicYear);
    
            const aggregationPipeline = [
                {
                    $match: matchCriteria
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
                        totalAmount: { $sum: "$feesDetails.installment.amount" }
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
            ];
    
            const fee = await feesInstallmentModel.aggregate(aggregationPipeline);
    
            const response = {
                totalFees: 0,
                pendingFees: 0,
                paidFees: 0
            };
    
            if (fee.length > 0) {
                console.log(fee);
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
    
    async getAllDataByCourseId(groupId, courseId) {
        try {
            const classes = await ClassModel.find({ courseId, groupId });
            return classes;
        } catch (error) {
            throw error;
        }
    }

    async getTotalStudentsForClass(classId, groupId) {
        try {
            const totalStudents = await studentAdmissionModel.countDocuments({
                "courseDetails.class_id": (classId),
                groupId: groupId
            });
            return totalStudents;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getTotalFeesAndPendingFeesForClass(classId, groupId, feesTemplateId, academicYear) {
        try {
            let fee = await feesInstallmentModel.aggregate([
                {
                    $match: {
                        "courseDetails.class_id": Number(classId),
                        "groupId": Number(groupId),
                        "feesDetails.feesTemplateId": Number(feesTemplateId),
                        "academicYear": Number(academicYear)
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
                        totalAmount: { $sum: "$feesDetails.installment.amount" }
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
                        totalAmountAllStatus: { $sum: "$totalAmount" },
                        totalStudents: { $sum: 1 }
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
    async  getPendingInstallmentByAdmissionId(addmissionId) {
        try {
            const pipeline = [
                {
                    $match: {
                        addmissionId: addmissionId
                    }
                },
                {
                    $project: {
                        addmissionId: 1,
                        groupId: 1,
                        academicYear: 1,
                        courseDetails: 1,
                        createdAt: 1,
                        documents: 1,
                        updatedAt: 1,
                        feesDetails: {
                            $filter: {
                                input: "$feesDetails",
                                as: "feesDetail",
                                cond: {
                                    $anyElementTrue: {
                                        $map: {
                                            input: "$$feesDetail.installment",
                                            as: "installment",
                                            in: { $eq: ["$$installment.status", "pending"] }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            ];
    
            console.log("Pipeline:", JSON.stringify(pipeline)); // Log the pipeline
    
            const result = await feesInstallmentModel.aggregate(pipeline);
    
            console.log("Result:", result); // Log the result
    
            return result;
        } catch (error) {
            console.error("Error retrieving pending installment:", error);
            throw error;
        }
    }
    
    
    
    

}
module.exports = new feesInstallmentService(feesInstallmentModel, "FeesInstallation");