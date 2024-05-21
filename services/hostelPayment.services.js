const hostelPaymentModel = require("../schema/hostelPayment.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class hostelPaymentService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllHostelPaymentByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        criteria.pageSize = 10;
        if (criteria.hostelPaymentId)
            query.hostelPaymentId = criteria.hostelPaymentId;
        if (criteria.studentId) query.studentId = criteria.studentId;
        if (criteria.memberId) query.memberId = criteria.memberId;
        if (criteria.hostelId) query.hostelId = criteria.hostelId;
        return this.preparePaginationAndReturnData(query, criteria);
    }
    async getByAdmissionAndEmpId(hostelAdmissionId, feesDetailsId, empId) {
        return this.execute(() => {
            return this.model
                .findOne({
                    hostelAdmissionId: hostelAdmissionId,
                    feesDetailsId: feesDetailsId,
                    empId: empId,
                })
                .sort({ _id: -1 });
        });
    }
    
    async updatePaidAmountInDatabase(
        hostelPaymentId,
        totalPaidAmount,
        remainingAmount
    ) {
        try {
            const feesPayment = await hostelPaymentModel.findOne({
                hostelPaymentId: hostelPaymentId,
            });
            if (!feesPayment) {
                return {
                    success: false,
                    error: "Fees payment record not found.",
                };
            }
            feesPayment.paidAmount = Math.round(totalPaidAmount);
            feesPayment.remainingAmount = Math.round(remainingAmount);
            await feesPayment.save();

            return { success: true };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                error: "Failed to update paid amount in the database.",
            };
        }
    }
    async deleteHostelPaymentId(hostelPaymentId, groupId) {
        try {
            return await hostelPaymentModel.deleteOne(hostelPaymentId, groupId);
        } catch (error) {
            throw error;
        }
    }
    async updateHostelPaymentById(hostelPaymentId, groupId, newData) {
        try {
            const updateHostelPaymnet =
                await hostelPaymentModel.findOneAndUpdate(
                    { hostelPaymentId: hostelPaymentId, groupId: groupId },
                    newData,
                    { new: true }
                );
            return updateHostelPaymnet;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new hostelPaymentService(hostelPaymentModel, "hostelPayment");
