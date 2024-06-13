const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const HostelAdmissionCancelModel = require("../schema/hosteladmissioncancel.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class HostelAdmissionCancelService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getAllDataByGroupId(groupId, criteria, page, pageSize) {
        const matchStage = {
            groupId: Number(groupId),
        };
        const totalItemsCount = await HostelAdmissionCancelModel.countDocuments(
            matchStage
        );
        if (criteria.name) {
            matchStage["name"] = { $regex: new RegExp(criteria.name, "i") };
        }
        if (criteria.status) {
            matchStage["status"] = { $regex: new RegExp(criteria.status, "i") };
        }
        const skip = (page - 1) * pageSize;

        const aggregationPipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: "hostelpayments",
                    localField: "hostelPaymentId",
                    foreignField: "hostelPaymentId",
                    as: "paymentDetails"
                }
            },
            {
                $unwind: {
                    path: "$paymentDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "hosteladmissions",
                    localField: "hostelAdmissionId",
                    foreignField: "hostelAdmissionId",
                    as: "hostelDetails"
                }
            },
            {
                $unwind: {
                    path: "$hostelDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    name: 1,
                    status: 1,
                    groupId: 1,
                    hostelAdmissionId: 1,
                    hostelPaymentId: 1,
                    userId: 1,
                    phoneNumber: "$hostelDetails.phoneNumber",
                    remeningAmount: "$paymentDetails.remainingAmount"
                }
            },
            { $skip: skip },
            { $limit: pageSize },
        ];

        try {
            const responseData = await HostelAdmissionCancelModel.aggregate(
                aggregationPipeline
            );

            const response = {
                data: {
                    items: responseData,
                    totalItemsCount: totalItemsCount,
                },
            };

            return response;
        } catch (error) {
            console.error("Error fetching data:", error);
            throw new Error("Failed to fetch data. Please try again later.");
        }
    }

    async updateAdmissionStatus(groupId, hostelAdmissionId) {
        try {
            await HostelAdmissionCancelModel.updateOne(
                { groupId: groupId, hostelAdmissionId: hostelAdmissionId },
                { $set: { status: "approved" } }
            );

            const updateResult = await HostelAdmissionCancelModel.updateOne(
                { groupId: groupId, hostelAdmissionId: hostelAdmissionId },
                { $set: { admissionStatus: "Cancel" } }
            );

            return updateResult;
        } catch (error) {
            console.error("Error updating admission status:", error);
            throw error;
        }
    }
    async getByCourseIdAndGroupId(groupId, hostelAdmissionId) {
        const result = await this.model.findOne({
            groupId: groupId,
            hostelAdmissionId: hostelAdmissionId,
        });
        return new ServiceResponse({
            data: result,
        });
    }
}

module.exports = new HostelAdmissionCancelService(HostelAdmissionCancelModel, 'hosteladmissioncancel');
