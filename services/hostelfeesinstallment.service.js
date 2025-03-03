const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const HostelFeesInstallmentModel = require("../schema/hostelfeesinstallment.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class HostelFeesInstallmentService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getAllHostelFeesInstallmentByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };

        criteria.pageSize = 10;
        if (criteria.studentId) query.studentId = criteria.studentId;
        if (criteria.hostelInstallmentId)
            query.hostelInstallmentId = criteria.hostelInstallmentId;
        if (criteria.empId) query.empId = criteria.empId;
        if (criteria.installmentNo)
            query.installmentNo = criteria.installmentNo;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async getByInstallmentId(hostelInstallmentId) {
        return this.execute(() => {
            return this.model.findOne({ hostelInstallmentId: hostelInstallmentId })
        });
    }

    async updateFeesInstallmentById(hostelInstallmentId, newFeesDetails, newData) {
        try {
            const updateResult = await HostelFeesInstallmentModel.findOneAndUpdate(
                { hostelInstallmentId: hostelInstallmentId },
                { feesDetails: newFeesDetails, ...newData },
                { new: true }
            ).lean();
            return updateResult;
        } catch (error) {
            throw error;
        }
    }

    async getPendingInstallmentByAdmissionId(hostelAdmissionId) {
        try {
            const pipeline = [
                {
                    $match: {
                        hostelAdmissionId: hostelAdmissionId,
                    },
                },
                {
                    $project: {
                        hostelAdmissionId: 1,
                        groupId: 1,
                        academicYear: 1,
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
                                            in: {
                                                $eq: [
                                                    "$$installment.status",
                                                    "pending",
                                                ],
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            ];

            console.log("Pipeline:", JSON.stringify(pipeline));
            const result = await HostelFeesInstallmentModel.aggregate(pipeline).exec();

            console.log("Result:", result);

            return result;
        } catch (error) {
            console.error("Error retrieving pending installment:", error);
            throw error;
        }
    }

    async updateInstallmentAmount(hostelInstallmentId, newAmount, newStatus) {
        console.log(hostelInstallmentId, newAmount);
        try {
            const updateResult = await HostelFeesInstallmentModel.findOneAndUpdate(
                { "feesDetails.installment.installmentNo": hostelInstallmentId },
                {
                    $set: {
                        "feesDetails.$[outer].installment.$[inner].amount": newAmount,
                        "feesDetails.$[outer].installment.$[inner].status": newStatus,
                    },
                },
                {
                    arrayFilters: [
                        { "outer.installment.installmentNo": hostelInstallmentId },
                        { "inner.installmentNo": hostelInstallmentId },
                    ],
                    multi: true,
                    new: true,
                }
            ).lean();

            console.log("Installment amount updated successfully:", updateResult);

            const feesDetail = updateResult.feesDetails.find((detail) =>
                detail.installment.some(
                    (installment) => installment.installmentNo === hostelInstallmentId
                )
            );
            const allInstallmentsPaid = feesDetail.installment.every(
                (installment) => installment.status === "paid"
            );
            if (allInstallmentsPaid) {
                await HostelFeesInstallmentModel.findOneAndUpdate(
                    { "feesDetails._id": feesDetail._id },
                    { $set: { "feesDetails.$.status": "paid" } }
                ).lean();
            } else {
                await HostelFeesInstallmentModel.findOneAndUpdate(
                    { "feesDetails._id": feesDetail._id },
                    { $set: { "feesDetails.$.status": "pending" } }
                ).lean();
            }
        } catch (error) {
            console.error("Error updating installment amount:", error);
        }
    }
    async updateUser(hostelAdmissionId, groupId, data) {
        try {
            const resp = await HostelFeesInstallmentModel.findOneAndUpdate(
                { hostelAdmissionId: hostelAdmissionId, groupId: groupId },
                data,
                { upsert: true, new: true }
            ).lean();

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

    async markAsDeletedByUser(id, userId) {
        try {
            const result = await HostelFeesInstallmentModel.findByIdAndUpdate(
                id,
                { $addToSet: { deletedByUsers: { userId: userId } }, $set: { deleted: true } },
                { new: true }
            ).lean();
            return new ServiceResponse({ data: result });
        } catch (error) {
            return new ServiceResponse({ isError: true, message: error.message });
        }
    }

    async getNonDeletedForUser(userId) {
        try {
            const result = await HostelFeesInstallmentModel.find({
                'deletedByUsers.userId': { $ne: userId },
                deleted: false
            }).lean();
            return new ServiceResponse({ data: result });
        } catch (error) {
            return new ServiceResponse({ isError: true, message: error.message });
        }
    }

    async updateStatusFlagByInstallmentId(hostelInstallmentId, isActive) {
        try {
            const updateResult = await HostelFeesInstallmentModel.findOneAndUpdate(
                { hostelInstallmentId: hostelInstallmentId },
                { deleted: !isActive },
                { new: true }
            ).lean();
            return new ServiceResponse({ data: updateResult });
        } catch (error) {
            return new ServiceResponse({ isError: true, message: error.message });
        }
    }

    async getAllByCriteria(criteria) {
        const query = {
            isActive: criteria.isActive !== undefined ? criteria.isActive : true 
        };

        if (criteria.groupId) query.groupId = criteria.groupId;
        if (criteria.hostelInstallmentId) query.hostelInstallmentId = criteria.hostelInstallmentId;
        if (criteria.hostelAdmissionId) query.hostelAdmissionId = criteria.hostelAdmissionId;
        if (criteria.status) query.status = new RegExp(criteria.status, "i");


        criteria.pageSize = criteria.pageSize || 10;

        return this.preparePaginationAndReturnData(query, criteria);
    }





}

module.exports = new HostelFeesInstallmentService(HostelFeesInstallmentModel, 'hostelfeesinstallment');

