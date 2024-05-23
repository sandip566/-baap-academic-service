const hostelPaymentModel = require("../schema/hostelPayment.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const hostelPremisesModel = require("../schema/hostelPremises.schema");
const HostelAdmissionModel = require("../schema/hosteladmission.schema");

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
    async getFeesStatData(groupId, criteria, page, limit) {
        return this.execute(async () => {
            try {
                const skip = (page - 1) * limit;
                const query = {
                    groupId: groupId,
                };

                let courseData = await hostelPremisesModel.find({
                    groupId: groupId,
                });
                let courseID;
                let courseFee;
                let paginationAdmissionData = await HostelAdmissionModel.find({
                    groupId: Number(groupId),
                    // academicYear: criteria.academicYear,
                    admissionStatus: "Confirm",
                });
                let matchStage = {
                    groupId: Number(groupId),
                    // academicYear: criteria.academicYear,
                    admissionStatus: "Confirm",
                };
                let feesMatchStage = {
                    "hostelPaymentData.groupId": Number(groupId),
                    // "feesPaymentData.academicYear": criteria.academicYear,
                    // "feesPaymentData.isShowInAccounting": true,
                };

                if (criteria.currentDate) {
                    feesMatchStage["hostelPaymentData.currentDate"] =
                        criteria.currentDate;
                }

                let date = new Date();
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
                const day = String(date.getDate()).padStart(2, "0");
                let currentDate = `${year}/${month}/${day}`;

                if (criteria.month) {
                    feesMatchStage["hostelPaymentData.currentDate"] = {
                        $regex: `/${criteria.month}/`,
                        $options: "i",
                    };
                }

                if (criteria.startDate && criteria.endDate) {
                    feesMatchStage["hostelPaymentData.currentDate"] = {
                        $gte: criteria.startDate,
                        $lte: criteria.endDate,
                    };
                }
                if (criteria.feesTemplateId) {
                    matchStage["feesDetails.feesTemplateId"] = Number(
                        criteria.feesTemplateId
                    );
                }
                if (criteria.location) {
                    matchStage["location"] = criteria.location;
                }
                // if (criteria.department) {
                //     matchStage["courseDetails.department_id"] = Number(
                //         criteria.department
                //     );
                // }
                // if (criteria.course) {
                //     matchStage["courseDetails.course_id"] = Number(
                //         criteria.course
                //     );
                // }
                // if (criteria.class) {
                //     matchStage["courseDetails.class_id"] = Number(
                //         criteria.class
                //     );
                // }

                // if (criteria.division) {
                //     matchStage["courseDetails.division_id"] = Number(
                //         criteria.division
                //     );
                // }

                let admissionData = await HostelAdmissionModel.aggregate([
                    { $match: matchStage },
                    {
                        $addFields: {
                            overdue: {
                                $anyElementTrue: {
                                    $map: {
                                        input: "$feesDetails",
                                        as: "feeDetail",
                                        in: {
                                            $anyElementTrue: {
                                                $map: {
                                                    input: "$$feeDetail.installment",
                                                    as: "inst",
                                                    in: {
                                                        $cond: [
                                                            {
                                                                $and: [
                                                                    {
                                                                        $eq: [
                                                                            "$$inst.status",
                                                                            "pending",
                                                                        ],
                                                                    },
                                                                    {
                                                                        $lt: [
                                                                            {
                                                                                $dateFromString:
                                                                                    {
                                                                                        dateString:
                                                                                            "$$inst.date",
                                                                                        format: "%Y-%m-%d",
                                                                                    },
                                                                            },
                                                                            {
                                                                                $toDate:
                                                                                    currentDate,
                                                                            },
                                                                        ],
                                                                    },
                                                                ],
                                                            },
                                                            true,
                                                            false,
                                                        ],
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            hostelAdmissionId: 1,
                            // academicYear: 1,
                            admissionStatus: 1,
                            caste: 1,
                            empId: 1,
                            groupId: 1,
                            location: 1,
                            phoneNumber: 1,
                            religion: 1,
                            roleId: 1,
                            userId: 1,
                            hostelInstallmentId: 1,
                            status: 1,
                            name: 1,
                            feesDetails: 1,
                            overdue: 1,
                        },
                    },
                    {
                        $addFields: {
                            feesDetailsInstallmentLength: {
                                $size: {
                                    $arrayElemAt: [
                                        "$feesDetails.installment",
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: "hostelpayments",
                            localField: "hostelAdmissionId",
                            foreignField: "hostelAdmissionId",
                            as: "hostelPaymentData",
                        },
                    },
                    { $match: feesMatchStage },
                    {
                        $addFields: {
                            "hostelPaymentData.totalPaidAmount": {
                                $sum: {
                                    $map: {
                                        input: "$hostelPaymentData",
                                        as: "payment",
                                        in: {
                                            $toDouble: "$$payment.paidAmount",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    {
                        $addFields: {
                            hostelPaymentData: {
                                $arrayElemAt: ["$hostelPaymentData", -1],
                            },
                        },
                    },
                    {
                        $match: {
                            "hostelPaymentData.groupId": Number(groupId),
                            // "hostelPaymentData.academicYear":
                            //     criteria.academicYear,
                            // "hostelPaymentData.isShowInAccounting": true,
                        },
                    },
                    {
                        $addFields: {
                            "hostelPaymentData.installment": {
                                $map: {
                                    input: "$hostelPaymentData.installment",
                                    as: "item",
                                    in: {
                                        $mergeObjects: [
                                            "$$item",
                                            {
                                                overdue: {
                                                    $cond: [
                                                        {
                                                            $and: [
                                                                {
                                                                    $eq: [
                                                                        "$$item.status",
                                                                        "pending",
                                                                    ],
                                                                },
                                                                {
                                                                    $lt: [
                                                                        {
                                                                            $dateFromString:
                                                                                {
                                                                                    dateString:
                                                                                        "$$item.date",
                                                                                    format: "%Y-%m-%d",
                                                                                },
                                                                        },
                                                                        currentDate,
                                                                    ],
                                                                },
                                                            ],
                                                        },
                                                        true,
                                                        false,
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                    },
                    {
                        $addFields: {
                            isDue: {
                                $anyElementTrue:
                                    "$hostelPaymentData.installment.overdue",
                            },
                        },
                    },

                    // { $skip: skip },
                    // { $limit: limit },
                ]);
                console.log(admissionData);
                const seed = (page - 1) * limit;
                const servicesWithData = await admissionData
                    .map((data, index) => ({
                        candidateName: data?.name,
                        hostelAdmissionId: data?.hostelAdmissionId,
                        hostelPremisesNAme:
                            data?.hostelPaymentData?.hostelPremisesNAme,
                        numberOfRooms: data?.hostelPaymentData?.numberOfRooms,
                        numberOfBed: data?.hostelPaymentData?.numberOfBed,
                        empId: data?.empId,
                        feesPaymentId: data?.hostelPaymentData?.feesPaymentId,
                        installments: data?.feesDetailsInstallmentLength,
                        groupId: data?.groupId,
                        installmentId: data?.installmentId,
                        paidAmount: data.hostelPaymentData?.totalPaidAmount,
                        phoneNumber: data.phoneNumber,
                        remainingAmount:
                            data.hostelPaymentData?.remainingAmount,
                        status: data.overdue ? "overdue" : data.status,
                        __seed: seed + index,
                    }))
                    .sort((a, b) => a.__seed - b.__seed)
                    .slice(skip, skip + limit);

                const totalFees = servicesWithData.reduce(
                    (total, service) => total + service.hostelFee,
                    0
                );
                const totalItemsCount = servicesWithData.length;

                const response = {
                    status: "Success",
                    servicesWithData: [servicesWithData],
                    totalFees: totalFees,
                    totalItemsCount: admissionData.length,
                };
                // console.log(admissionData);
                return response;
            } catch (error) {
                console.error("Error occurred:", error);
                throw error;
            }
        });
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
