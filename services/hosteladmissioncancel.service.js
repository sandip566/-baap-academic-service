const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const HostelAdmissionCancelModel = require("../schema/hosteladmissioncancel.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const hostelAdmissionModel = require("../schema/hosteladmission.schema");

class HostelAdmissionCancelService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getAllDataByGroupId(groupID, criteria) {
        try {
            const groupId = parseInt(groupID);
            if (isNaN(groupId)) {
                throw new Error("Invalid groupID");
            }
            const searchFilter = { groupId };
            const aggregationPipeline = [
                { $match: searchFilter },
                {
                    $lookup: {
                        from: "hostelpayments",
                        localField: "hostelPaymentId",
                        foreignField: "hostelPaymentId",
                        as: "paymentDetails",
                    },
                },
                {
                    $unwind: {
                        path: "$paymentDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $lookup: {
                        from: "hosteladmissions",
                        localField: "hostelAdmissionId",
                        foreignField: "hostelAdmissionId",
                        as: "hostelDetails",
                    },
                },
                {
                    $unwind: {
                        path: "$hostelDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                { $sort: { createdAt: -1 } },
            ];

            if (criteria.search) {
                const searchRegex = new RegExp(criteria.search.trim(), "i");
                aggregationPipeline.push({
                    $match: {
                        $or: [
                            { "hostelDetails.firstName": searchRegex },
                            { "hostelDetails.lastName": searchRegex },
                            { userId: { $eq: parseInt(criteria.search) } },
                            {
                                "hostelDetails.phoneNumber": {
                                    $eq: parseInt(criteria.search),
                                },
                            },
                        ],
                    },
                });
            }
            if (criteria.userId) {
                aggregationPipeline.push({
                    $match: { userId: parseInt(criteria.userId) },
                });
            }

            const page = parseInt(criteria.page) || 1;
            const limit = parseInt(criteria.limit) || 10;
            aggregationPipeline.push(
                { $skip: (page - 1) * limit },
                { $limit: limit }
            );

            const responseData = await HostelAdmissionCancelModel.aggregate(
                aggregationPipeline
            );
            const totalCount = await HostelAdmissionCancelModel.countDocuments(
                searchFilter
            );

            const response = {
                data: {
                    items: responseData,
                    totalItemsCount: totalCount,
                },
            };

            return response;
        } catch (error) {
            console.error("Error in getAllDataByGroupId:", error);
            throw new Error(
                "An error occurred while processing the request. Please try again later."
            );
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
            await hostelAdmissionModel.updateOne(
                {
                    groupId: groupId,
                    hostelAdmissionId: Number(hostelAdmissionId),
                },
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

module.exports = new HostelAdmissionCancelService(
    HostelAdmissionCancelModel,
    "hosteladmissioncancel"
);
