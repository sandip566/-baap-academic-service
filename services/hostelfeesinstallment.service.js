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
        if (criteria.installmentId)
            query.installmentId = criteria.installmentId;
        if (criteria.empId) query.empId = criteria.empId;
        if (criteria.installmentNo)
            query.installmentNo = criteria.installmentNo;
        return this.preparePaginationAndReturnData(query, criteria);
    }
    async getByInstallmentId(installmentId) {
        return this.execute(() => {
            return this.model.findOne({ installmentId: installmentId });
        });
    }
    async updateFeesInstallmentById(installmentId, newFeesDetails, newData) {
        try {
            const updateResult = await HostelFeesInstallmentModel.findOneAndUpdate(
                { installmentId: installmentId },
                { feesDetails: newFeesDetails, ...newData },
                { new: true }
            );
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
            const result = await HostelFeesInstallmentModel.aggregate(pipeline);

            console.log("Result:", result);

            return result;
        } catch (error) {
            console.error("Error retrieving pending installment:", error);
            throw error;
        }
    }
    async updateInstallmentAmount(installmentId, newAmount, newStatus) {
        console.log(installmentId, newAmount);
        try {
            const updateResult = await HostelFeesInstallmentModel.findOneAndUpdate(
                { "feesDetails.installment.installmentNo": installmentId },
                {
                    $set: {
                        "feesDetails.$[outer].installment.$[inner].amount":
                            newAmount,
                        "feesDetails.$[outer].installment.$[inner].status":
                            newStatus,
                    },
                },
                {
                    arrayFilters: [
                        { "outer.installment.installmentNo": installmentId },
                        { "inner.installmentNo": installmentId },
                    ],
                    multi: true,
                    new: true,
                }
            );

            console.log(
                "Installment amount updated successfully:",
                updateResult
            );

            const feesDetail = updateResult.feesDetails.find((detail) =>
                detail.installment.some(
                    (installment) => installment.installmentNo === installmentId
                )
            );
            const allInstallmentsPaid = feesDetail.installment.every(
                (installment) => installment.status === "paid"
            );
            if (allInstallmentsPaid) {
                await HostelFeesInstallmentModel.findOneAndUpdate(
                    { "feesDetails._id": feesDetail._id },
                    { $set: { "feesDetails.$.status": "paid" } }
                );
            } else {
                await HostelFeesInstallmentModel.findOneAndUpdate(
                    { "feesDetails._id": feesDetail._id },
                    { $set: { "feesDetails.$.status": "pending" } }
                );
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
}

module.exports = new HostelFeesInstallmentService(HostelFeesInstallmentModel, 'hostelfeesinstallment');
