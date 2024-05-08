const feesPaymentModel = require("../schema/feesPayment.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const StudentsAdmissionModel = require("../schema/studentAdmission.schema");
const courseModel = require("../schema/courses.schema");
const ClassModel = require("../schema/classes.schema");
const DivisionModel = require("../schema/division.schema");
const feesTemplateModel = require("../schema/feesTemplate.schema");
const FeesInstallmentModel = require("../schema/feesInstallment.schema");
const feesInstallmentServices = require("./feesInstallment.services");
const AcademicYearModel = require("../schema/academicyear.schema");
let visitedAddmissionIds = new Set();
const bookIssueLogService = require("../services/bookIssueLog.service");
class feesPaymentService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getRecoveryData(groupId, academicYear, skip, limit) {
        return this.execute(async () => {
            const aggregationResult = await this.model.aggregate([
                {
                    $match: {
                        groupId: Number(groupId),
                        academicYear: academicYear,
                        isShowInAccounting: true,
                    },
                },
                {
                    $lookup: {
                        from: "studentsadmissions",
                        localField: "addmissionId",
                        foreignField: "addmissionId",
                        as: "studentsadmissions",
                    },
                },

                {
                    $unwind: "$studentsadmissions",
                },
                {
                    $match: {
                        "studentsadmissions.admissionStatus": "Confirm",
                    },
                },
                {
                    $match: {
                        studentsadmissions: { $ne: [] },
                    },
                },
                {
                    $sort: { updatedAt: -1 },
                },
                {
                    $group: {
                        _id: "$addmissionId",
                        totalPaidAmount: {
                            $sum: {
                                $toDouble: "$paidAmount",
                            },
                        },

                        lastRemainingAmount: {
                            $first: {
                                $toDouble: "$remainingAmount",
                            },
                        },

                        className: { $first: "$className" },
                        courseName: { $first: "$courseName" },
                        updatedAt: { $first: "$updatedAt" },
                    },
                },
                {
                    $match: {
                        lastRemainingAmount: { $ne: 0 },
                    },
                },
                {
                    $project: {
                        admissionId: "$_id",
                        totalPaidAmount: 1,
                        lastRemainingAmount: 1,
                        className: 1,
                        courseName: 1,
                    },
                },
            ]);
            aggregationResult.sort((a, b) => b.updatedAt - a.updatedAt);
            console.log(aggregationResult);
            const combinedDataArray = [];

            for (const result of aggregationResult) {
                const { admissionId, totalPaidAmount, lastRemainingAmount } =
                    result;

                const admissionData = await StudentsAdmissionModel.findOne({
                    groupId: groupId,
                    addmissionId: admissionId,
                });

                if (admissionData) {
                    const admissionDetails = {
                        name: admissionData.name,
                        phoneNumber: admissionData.phoneNumber,
                        familyDetails: [
                            {
                                father_phone_number:
                                    admissionData?.familyDetails?.[0]
                                        ?.father_phone_number ?? null,
                            },
                        ],
                    };
                    const combinedData = {
                        paidAmount: totalPaidAmount,
                        className: result?.className,
                        courseName: result?.courseName,
                        remainingAmount: lastRemainingAmount,
                        admissionId: admissionId,
                        addmissionId: admissionDetails,
                    };

                    combinedDataArray.push(combinedData);
                }
            }

            const paginatedCombinedDataArray = combinedDataArray.slice(
                skip,
                skip + limit
            );
            const response = {
                servicesWithData: paginatedCombinedDataArray,
                totalStudentsRecords: combinedDataArray.length,
            };

            return response;
        });
    }

    async getRecoveryCount(groupId, academicYear) {
        return this.execute(async () => {
            const studentRecordCount =
                await StudentsAdmissionModel.countDocuments({
                    groupId: groupId,
                    academicYear: academicYear,
                    admissionStatus: "Confirm",
                });

            const aggregationResult = await this.model.aggregate([
                {
                    $match: {
                        groupId: Number(groupId),
                        academicYear: academicYear,
                        isShowInAccounting: true,
                    },
                },
                {
                    $lookup: {
                        from: "studentsadmissions",
                        localField: "addmissionId",
                        foreignField: "addmissionId",
                        as: "studentsadmissions",
                    },
                },

                {
                    $unwind: "$studentsadmissions",
                },
                {
                    $match: {
                        "studentsadmissions.admissionStatus": "Confirm",
                    },
                },
                {
                    $match: {
                        studentsadmissions: { $ne: [] },
                    },
                },
                {
                    $sort: {
                        addmissionId: 1,
                        currentDate: -1,
                    },
                },
                {
                    $sort: { updatedAt: -1 },
                },
                {
                    $group: {
                        _id: "$addmissionId",
                        totalPaidAmount: {
                            $sum: {
                                $toDouble: "$paidAmount",
                            },
                        },
                        lastRemainingAmount: {
                            $first: "$remainingAmount",
                        },
                    },
                },

                {
                    $project: {
                        _id: 0,
                        admissionId: "$_id",
                        totalPaidAmount: 1,
                        lastRemainingAmount: 1,
                    },
                },
            ]);

            console.log(aggregationResult);
            const totalPaidAmount = aggregationResult.reduce(
                (total, record) => {
                    return total + record.totalPaidAmount;
                },
                0
            );
            const totalRemainingAmount = aggregationResult.reduce(
                (total, record) => {
                    const remainingAmount = parseFloat(
                        record.lastRemainingAmount
                    );
                    return (
                        total + (isNaN(remainingAmount) ? 0 : remainingAmount)
                    );
                },
                0
            );
            const response = {
                totalRemainingAmount: totalRemainingAmount,
                totalPaidAmount: totalPaidAmount,
                StudentRecords: studentRecordCount,
            };

            return response;
        });
    }
    async getFeesStatData(groupId, criteria, page, limit) {
        return this.execute(async () => {
            try {
                const skip = (page - 1) * limit;
                const query = {
                    groupId: groupId,
                };

                let courseData = await courseModel.find({ groupId: groupId });
                let courseID;
                let courseFee;
                let paginationAdmissionData = await StudentsAdmissionModel.find(
                    {
                        groupId: groupId,
                        academicYear: criteria.academicYear,
                        admissionStatus: "Confirm",
                    }
                );
                let matchStage = {
                    groupId: Number(groupId),
                    // academicYear: criteria.academicYear,
                    admissionStatus: "Confirm",
                };
                let feesMatchStage = {
                    "feesPaymentData.groupId": Number(groupId),
                    "feesPaymentData.academicYear": criteria.academicYear,
                    "feesPaymentData.isShowInAccounting": true,
                };

                if (criteria.currentDate) {
                    feesMatchStage["feesPaymentData.currentDate"] =
                        criteria.currentDate;
                }

                let date = new Date();
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
                const day = String(date.getDate()).padStart(2, "0");
                let currentDate = `${year}/${month}/${day}`;

                if (criteria.month) {
                    feesMatchStage["feesPaymentData.currentDate"] = {
                        $regex: `/${criteria.month}/`,
                        $options: "i",
                    };
                }

                if (criteria.startDate && criteria.endDate) {
                    feesMatchStage["feesPaymentData.currentDate"] = {
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
                if (criteria.department) {
                    matchStage["courseDetails.department_id"] = Number(
                        criteria.department
                    );
                }
                if (criteria.course) {
                    matchStage["courseDetails.course_id"] = Number(
                        criteria.course
                    );
                }
                if (criteria.class) {
                    matchStage["courseDetails.class_id"] = Number(
                        criteria.class
                    );
                }

                if (criteria.division) {
                    matchStage["courseDetails.division_id"] = Number(
                        criteria.division
                    );
                }

                let admissionData = await StudentsAdmissionModel.aggregate([
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
                            addmissionId: 1,
                            academicYear: 1,
                            admissionStatus: 1,
                            caste: 1,
                            empId: 1,
                            groupId: 1,
                            location: 1,
                            phoneNumber: 1,
                            religion: 1,
                            roleId: 1,
                            userId: 1,
                            installmentId: 1,
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
                            from: "feespayments",
                            localField: "addmissionId",
                            foreignField: "addmissionId",
                            as: "feesPaymentData",
                        },
                    },
                    { $match: feesMatchStage },
                    {
                        $addFields: {
                            "feesPaymentData.totalPaidAmount": {
                                $sum: {
                                    $map: {
                                        input: "$feesPaymentData",
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
                            feesPaymentData: {
                                $arrayElemAt: ["$feesPaymentData", -1],
                            },
                        },
                    },
                    {
                        $match: {
                            "feesPaymentData.groupId": Number(groupId),
                            "feesPaymentData.academicYear":
                                criteria.academicYear,
                            "feesPaymentData.isShowInAccounting": true,
                        },
                    },
                    {
                        $addFields: {
                            "feesPaymentData.installment": {
                                $map: {
                                    input: "$feesPaymentData.installment",
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
                                    "$feesPaymentData.installment.overdue",
                            },
                        },
                    },

                    // { $skip: skip },
                    // { $limit: limit },
                ]);

                const seed = (page - 1) * limit;
                const servicesWithData = await admissionData
                    .map((data, index) => ({
                        candidateName: data?.name,
                        addmissionId: data?.addmissionId,
                        className: data?.feesPaymentData?.className,
                        courseFees: data?.feesPaymentData?.courseFee,
                        courseName: data?.feesPaymentData?.courseName,
                        empId: data?.empId,
                        feesPaymentId: data?.feesPaymentData?.feesPaymentId,
                        installments: data?.feesDetailsInstallmentLength,
                        groupId: data?.groupId,
                        installmentId: data?.installmentId,
                        paidAmount: data.feesPaymentData?.totalPaidAmount,
                        phoneNumber: data.phoneNumber,
                        remainingAmount: data.feesPaymentData?.remainingAmount,
                        status: data.overdue ? "overdue" : data.status,
                        __seed: seed + index,
                    }))
                    .sort((a, b) => a.__seed - b.__seed)
                    .slice(skip, skip + limit);

                const totalFees = servicesWithData.reduce(
                    (total, service) => total + service.courseFees,
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
    async getFeesStatWithDonationData(groupId, criteria, page, limit) {
        return this.execute(async () => {
            try {
                const skip = (page - 1) * limit;
                const query = {
                    groupId: groupId,
                };

                let courseData = await courseModel.find({ groupId: groupId });
                let courseID;
                let courseFee;
                let paginationAdmissionData = await StudentsAdmissionModel.find(
                    {
                        groupId: groupId,
                        academicYear: criteria.academicYear,
                        admissionStatus: "Confirm",
                    }
                );
                let matchStage = {
                    groupId: Number(groupId),
                    // academicYear: criteria.academicYear,
                    admissionStatus: "Confirm",
                };
                let feesMatchStage = {
                    "feesPaymentData.groupId": Number(groupId),
                    "feesPaymentData.academicYear": criteria.academicYear,
                    "feesPaymentData.isShowInAccounting": false,
                };

                if (criteria.currentDate) {
                    feesMatchStage["feesPaymentData.currentDate"] =
                        criteria.currentDate;
                }

                let date = new Date();
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
                const day = String(date.getDate()).padStart(2, "0");
                let currentDate = `${year}/${month}/${day}`;

                if (criteria.month) {
                    feesMatchStage["feesPaymentData.currentDate"] = {
                        $regex: `/${criteria.month}/`,
                        $options: "i",
                    };
                }

                if (criteria.startDate && criteria.endDate) {
                    feesMatchStage["feesPaymentData.currentDate"] = {
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
                if (criteria.department) {
                    matchStage["courseDetails.department_id"] = Number(
                        criteria.department
                    );
                }
                if (criteria.course) {
                    matchStage["courseDetails.course_id"] = Number(
                        criteria.course
                    );
                }
                if (criteria.class) {
                    matchStage["courseDetails.class_id"] = Number(
                        criteria.class
                    );
                }

                if (criteria.division) {
                    matchStage["courseDetails.division_id"] = Number(
                        criteria.division
                    );
                }

                let admissionData = await StudentsAdmissionModel.aggregate([
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
                            addmissionId: 1,
                            academicYear: 1,
                            admissionStatus: 1,
                            caste: 1,
                            empId: 1,
                            groupId: 1,
                            location: 1,
                            phoneNumber: 1,
                            religion: 1,
                            roleId: 1,
                            userId: 1,
                            installmentId: 1,
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
                            from: "feespayments",
                            localField: "addmissionId",
                            foreignField: "addmissionId",
                            as: "feesPaymentData",
                        },
                    },

                    { $match: feesMatchStage },
                    {
                        $addFields: {
                            "feesPaymentData.totalPaidAmount": {
                                $sum: {
                                    $map: {
                                        input: "$feesPaymentData",

                                        as: "payment",
                                        in: {
                                            $cond: [
                                                {
                                                    $eq: [
                                                        "$$payment.isShowInAccounting",
                                                        false,
                                                    ],
                                                },
                                                {
                                                    $toDouble:
                                                        "$$payment.paidAmount",
                                                },
                                                0,
                                            ],
                                            // $toDouble: "$$payment.paidAmount",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    {
                        $addFields: {
                            feesPaymentData: {
                                $arrayElemAt: ["$feesPaymentData", -1],
                            },
                        },
                    },
                    {
                        $match: {
                            "feesPaymentData.groupId": Number(groupId),
                            "feesPaymentData.academicYear":
                                criteria.academicYear,
                            "feesPaymentData.isShowInAccounting": false,
                        },
                    },
                    {
                        $addFields: {
                            "feesPaymentData.installment": {
                                $map: {
                                    input: "$feesPaymentData.installment",
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
                                    "$feesPaymentData.installment.overdue",
                            },
                        },
                    },

                    // { $skip: skip },
                    // { $limit: limit },
                ]);

                const seed = (page - 1) * limit;
                const servicesWithData = await admissionData
                    .map((data, index) => ({
                        candidateName: data?.name,
                        addmissionId: data?.addmissionId,
                        className: data?.feesPaymentData?.className,
                        courseFees: data?.feesPaymentData?.courseFee,
                        courseName: data?.feesPaymentData?.courseName,
                        empId: data?.empId,
                        feesPaymentId: data?.feesPaymentData?.feesPaymentId,
                        installments: data?.feesDetailsInstallmentLength,
                        groupId: data?.groupId,
                        installmentId: data?.installmentId,
                        paidAmount: data.feesPaymentData?.totalPaidAmount,
                        phoneNumber: data.phoneNumber,
                        remainingAmount: data.feesPaymentData?.remainingAmount,
                        status: data.overdue ? "overdue" : data.status,
                        __seed: seed + index,
                    }))
                    .sort((a, b) => a.__seed - b.__seed)
                    .slice(skip, skip + limit);

                const totalFees = servicesWithData.reduce(
                    (total, service) => total + service.courseFees,
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
    async getFeesDefaulter(groupId, criteria, page, limit) {
        return this.execute(async () => {
            try {
                const skip = (page - 1) * limit;
                const query = {
                    groupId: groupId,
                };

                let courseData = await courseModel.find({ groupId: groupId });
                let courseID;
                let courseFee;
                let paginationAdmissionData = await StudentsAdmissionModel.find(
                    {
                        groupId: groupId,
                        academicYear: criteria.academicYear,
                        admissionStatus: "Confirm",
                    }
                );
                let matchStage = {
                    groupId: Number(groupId),
                    // academicYear: criteria.academicYear,
                    status: "pending",
                    admissionStatus: "Confirm",
                };
                let feesMatchStage = {
                    "feesPaymentData.groupId": Number(groupId),
                    "feesPaymentData.academicYear": criteria.academicYear,
                    "feesPaymentData.isShowInAccounting": true,
                };

                if (criteria.currentDate) {
                    feesMatchStage["feesPaymentData.currentDate"] =
                        criteria.currentDate;
                }
                if (criteria.startDate && criteria.endDate) {
                    feesMatchStage["feesPaymentData.currentDate"] = {
                        $gte: criteria.startDate,
                        $lte: criteria.endDate,
                    };
                }
                let date = new Date();
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
                const day = String(date.getDate()).padStart(2, "0");
                let currentDate = `${year}/${month}/${day}`;

                if (criteria.month) {
                    feesMatchStage["feesPaymentData.currentDate"] = {
                        $regex: `/${criteria.month}/`,
                        $options: "i",
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
                if (criteria.department) {
                    matchStage["courseDetails.department_id"] = Number(
                        criteria.department
                    );
                }
                if (criteria.course) {
                    matchStage["courseDetails.course_id"] = Number(
                        criteria.course
                    );
                }
                if (criteria.class) {
                    matchStage["courseDetails.class_id"] = Number(
                        criteria.class
                    );
                }

                if (criteria.division) {
                    matchStage["courseDetails.division_id"] = Number(
                        criteria.division
                    );
                }
                // let date = new Date();
                // const year = date.getFullYear();
                // const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
                // const day = String(date.getDate()).padStart(2, "0");
                // let currentDate = `${year}/${month}/${day}`;
                console.log(currentDate);
                let admissionData = await StudentsAdmissionModel.aggregate([
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
                            addmissionId: 1,
                            academicYear: 1,
                            admissionStatus: 1,
                            caste: 1,
                            empId: 1,
                            groupId: 1,
                            location: 1,
                            phoneNumber: 1,
                            religion: 1,
                            roleId: 1,
                            userId: 1,
                            installmentId: 1,
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
                            from: "feespayments",
                            localField: "addmissionId",
                            foreignField: "addmissionId",
                            as: "feesPaymentData",
                        },
                    },
                    { $match: feesMatchStage },
                    {
                        $addFields: {
                            "feesPaymentData.totalPaidAmount": {
                                $sum: {
                                    $map: {
                                        input: "$feesPaymentData",
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
                            feesPaymentData: {
                                $arrayElemAt: ["$feesPaymentData", -1],
                            },
                        },
                    },
                    {
                        $match: {
                            "feesPaymentData.groupId": Number(groupId),
                            "feesPaymentData.academicYear":
                                criteria.academicYear,
                            "feesPaymentData.isShowInAccounting": true,
                        },
                    },
                    {
                        $addFields: {
                            "feesPaymentData.installment": {
                                $map: {
                                    input: "$feesPaymentData.installment",
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
                                    "$feesPaymentData.installment.overdue",
                            },
                        },
                    },
                    // { $skip: skip },
                    // { $limit: limit },
                ]);
                const seed = (page - 1) * limit;
                const servicesWithData = await admissionData
                    .filter((data) => data.status !== "paid")
                    .map((data, index) => ({
                        candidateName: data?.name,
                        addmissionId: data?.addmissionId,
                        className: data?.feesPaymentData?.className,
                        courseFees: data?.feesPaymentData?.courseFee,
                        courseName: data?.feesPaymentData?.courseName,
                        empId: data?.empId,
                        feesPaymentId: data?.feesPaymentData?.feesPaymentId,
                        installments: data?.feesDetailsInstallmentLength,
                        groupId: data?.groupId,
                        installmentId: data?.installmentId,
                        paidAmount: data.feesPaymentData?.totalPaidAmount,
                        phoneNumber: data.phoneNumber,
                        remainingAmount: data.feesPaymentData?.remainingAmount,
                        status: data.overdue ? "overdue" : data.status,
                        __seed: seed + index,
                    }))
                    .sort((a, b) => {
                        if (a.status === "overdue" && b.status !== "overdue")
                            return -1;
                        if (a.status === "pending" && b.status !== "pending")
                            return 1;
                        return a.__seed - b.__seed;
                    })
                    // .sort((a, b) => a.__seed - b.__seed)
                    .slice(skip, skip + limit);

                const totalFees = servicesWithData.reduce(
                    (total, service) => total + service.courseFees,
                    0
                );

                const response = {
                    servicesWithData: [servicesWithData],
                    totalFees: totalFees,
                    totalItemsCount: admissionData.length,
                };

                console.log(admissionData);
                return response;
            } catch (error) {
                console.error("Error occurred:", error);
                throw error;
            }
        });
    }

    async getFeesTotalCount(groupId, criteria, page, limit) {
        return this.execute(async () => {
            try {
                const skip = (page - 1) * limit;

                const query = {
                    groupId: groupId,
                };

                let courseData = await courseModel.find({ groupId: groupId });
                let courseID;
                let courseFee;
                let admissionData = await StudentsAdmissionModel.find({
                    groupId: groupId,
                    academicYear: criteria.academicYear,
                    admissionStatus: "Confirm",
                });

                let feesData = await this.model.find({
                    groupId: groupId,
                    academicYear: criteria.academicYear,
                    isShowInAccounting: false,
                });

                console.log(
                    "criteria.currentDate, criteria.currentDate,feesData",
                    feesData.length
                );
                const currentDateValue = criteria.currentDate
                    ? criteria.currentDate
                    : null;
                // console.log(currentDateValue);
                const currentDateObj = currentDateValue
                    ? new Date(currentDateValue)
                    : null;

                if (currentDateObj) {
                    const year = currentDateObj.getFullYear();
                    const month = String(
                        currentDateObj.getMonth() + 1
                    ).padStart(2, "0");
                    const day = String(currentDateObj.getDate()).padStart(
                        2,
                        "0"
                    );
                    const formattedDate = `${year}/${month}/${day}`;

                    feesData = feesData.filter(
                        (fee) => fee.currentDate === formattedDate
                    );
                }
                if (criteria.startDate && criteria.endDate) {
                    feesData = feesData.filter((fee) => {
                        return (
                            fee.currentDate >= criteria.startDate &&
                            fee.currentDate <= criteria.endDate
                        );
                    });
                }

                if (criteria.month) {
                    query.month = criteria.month;
                    const month = query.month.padStart(2, "0");
                    feesData = feesData.filter((data) => {
                        const currentDate = new Date(data.currentDate);
                        const dataMonth = String(
                            currentDate.getMonth() + 1
                        ).padStart(2, "0");
                        return dataMonth === month;
                    });
                }

                if (criteria.academicYear) {
                    query.academicYear = criteria.academicYear;
                    feesData = feesData.filter(
                        (data) => data.academicYear === query.academicYear
                    );
                }

                if (criteria.location) {
                    query.location = criteria.location;
                    admissionData = admissionData.filter(
                        (data) => data.location == query.location
                    );
                }

                if (criteria.department) {
                    query.department = criteria.department;
                    admissionData = admissionData.filter((data) => {
                        if (
                            data.courseDetails &&
                            data.courseDetails.length > 0
                        ) {
                            let matchingdepartment = data.courseDetails.some(
                                (departments) =>
                                    departments.department_id &&
                                    departments.department_id.toString() ===
                                        query.department.toString()
                            );
                            return matchingdepartment;
                        }
                        return false;
                    });
                }
                if (criteria.feesTemplateId) {
                    query.feesTemplateId = criteria.feesTemplateId;
                    admissionData = admissionData.filter((data) => {
                        if (data.feesDetails && data.feesDetails.length > 0) {
                            let matchingfeesTemplateId = data.feesDetails.some(
                                (feesTemplate) =>
                                    feesTemplate.feesTemplateId &&
                                    feesTemplate.feesTemplateId.toString() ===
                                        query.feesTemplateId.toString()
                            );
                            return matchingfeesTemplateId;
                        }
                        return false;
                    });
                }
                if (criteria.course) {
                    query.course = criteria.course;
                    admissionData = admissionData.filter((data) => {
                        if (
                            data.courseDetails &&
                            data.courseDetails.length > 0
                        ) {
                            const matchingCourses = data.courseDetails.some(
                                (course) =>
                                    course.course_id &&
                                    course.course_id.toString() ===
                                        query.course.toString()
                            );
                            // console.log("matchingCourses", matchingCourses);
                            return matchingCourses;
                        }
                        return false;
                    });
                }

                if (criteria.class) {
                    query.class = criteria.class;
                    admissionData = admissionData.filter((data) => {
                        if (
                            data.courseDetails &&
                            data.courseDetails.length > 0
                        ) {
                            let matchingclasses = data.courseDetails.some(
                                (classes) =>
                                    classes.class_id &&
                                    classes.class_id.toString() ===
                                        query.class.toString()
                            );
                            return matchingclasses;
                        }
                        return false;
                    });
                }

                if (criteria.division) {
                    query.division = criteria.division;
                    admissionData = admissionData.filter((data) => {
                        if (
                            data.courseDetails &&
                            data.courseDetails.length > 0
                        ) {
                            let matchingdivision = data.courseDetails.some(
                                (divisions) =>
                                    divisions.division_id &&
                                    divisions.division_id.toString() ===
                                        query.division.toString()
                            );
                            return matchingdivision;
                        }
                        return false;
                    });
                }

                let coursePayments = {};
                courseData.forEach((course) => {
                    courseID = course.courseId;
                    courseFee = course.Fees;
                    coursePayments[course.CourseName] = {
                        totalPaidAmount: 0,
                        totalRemainingAmount: 0,
                        courseId: courseID,
                        courseFee: courseFee,
                    };
                });

                admissionData.forEach((admission) => {
                    if (
                        admission.courseDetails &&
                        admission.courseDetails.length > 0
                    ) {
                        admission.courseDetails.forEach((courseDetail) => {
                            const courseId = courseDetail?.course_id;

                            const courseExists = courseData.find(
                                (course) => course.courseId === courseId
                            );

                            if (courseExists) {
                                const courseName = courseExists.CourseName;

                                const paymentsForCourse = feesData.filter(
                                    (payment) =>
                                        payment.addmissionId ===
                                        admission.addmissionId
                                );
                                const paidAmountForCourse =
                                    paymentsForCourse.reduce(
                                        (total, payment) =>
                                            total +
                                            parseFloat(payment.paidAmount || 0),
                                        0
                                    );

                                const remainingAmountForCourse =
                                    paymentsForCourse.reduce(
                                        (total, paymentArray, currentIndex) => {
                                            const lastIndex =
                                                currentIndex ===
                                                paymentsForCourse.length - 1
                                                    ? paymentArray
                                                    : null;

                                            const remainingAmount = lastIndex
                                                ? parseFloat(
                                                      lastIndex.remainingAmount ||
                                                          0
                                                  )
                                                : 0;

                                            return total + remainingAmount;
                                        },
                                        0
                                    );

                                if (!coursePayments[courseName].noOfStudents) {
                                    coursePayments[courseName].noOfStudents = 0;
                                }
                                coursePayments[courseName].noOfStudents++;

                                if (!coursePayments[courseName].courseId) {
                                    coursePayments[courseName].courseId =
                                        courseID;
                                }
                                if (!coursePayments[courseName].courseFee) {
                                    coursePayments[courseName].courseFee =
                                        courseFee;
                                }

                                coursePayments[courseName].totalPaidAmount +=
                                    paidAmountForCourse;

                                coursePayments[
                                    courseName
                                ].totalRemainingAmount +=
                                    remainingAmountForCourse;
                            }
                        });
                    }
                });
                let formattedCoursePayments = Object.keys(coursePayments).map(
                    (courseName) => {
                        console.log(courseName);
                        let lastPaymentPerAdmission = {};

                        let totalFee = 0;

                        admissionData.forEach((admission) => {
                            const admissionId = admission.addmissionId;

                            const correspondingPayment = feesData.find(
                                (payment) =>
                                    payment.addmissionId === admissionId
                            );

                            if (
                                correspondingPayment &&
                                correspondingPayment.courseName === courseName
                            ) {
                                totalFee += correspondingPayment.courseFee;
                            }
                        });

                        console.log(
                            "Total fee for course '" +
                                courseName +
                                "': " +
                                totalFee
                        );

                        return {
                            name: courseName,
                            courseId: coursePayments[courseName].courseId,
                            courseFee: totalFee,
                            TotalCourseFee:
                                coursePayments[courseName].courseFee *
                                    coursePayments[courseName].noOfStudents ||
                                0,
                            noOfStudents:
                                coursePayments[courseName].noOfStudents || 0,
                            totalPaidAmount:
                                coursePayments[courseName].totalPaidAmount,
                            totalRemainingAmount:
                                coursePayments[courseName].totalRemainingAmount,
                        };
                    }
                );
                let totalPaidAmount = 0;
                let totalRemainingAmount = 0;
                let totalCourseFee = 0;
                let totalCourseFee1 = 0;
                formattedCoursePayments.forEach((course) => {
                    totalPaidAmount += course.totalPaidAmount || 0;
                    totalRemainingAmount += course.totalRemainingAmount || 0;
                });

                totalCourseFee = formattedCoursePayments.reduce(
                    (total, course) => {
                        return total + parseFloat(course.courseFee || 0);
                    },
                    0
                );
                let response = {
                    coursePayments: formattedCoursePayments,
                    totalItemsCount: admissionData.length,
                    totalFees: totalPaidAmount + totalRemainingAmount || 0,
                    totalPaidFees: totalPaidAmount,
                    totalPendingFees: totalRemainingAmount,
                };

                return response;
            } catch (error) {
                console.error("Error occurred:", error);
                throw error;
            }
        });
    }
    async getDonationFeesListCount(groupId, criteria, page, limit) {
        return this.execute(async () => {
            try {
                const skip = (page - 1) * limit;

                const query = {
                    groupId: groupId,
                };

                let courseData = await courseModel.find({ groupId: groupId });
                let courseID;
                let courseFee;
                let admissionData = await StudentsAdmissionModel.find({
                    groupId: groupId,
                    academicYear: criteria.academicYear,
                    admissionStatus: "Confirm",
                });

                let feesData = await this.model.find({
                    groupId: groupId,
                    academicYear: criteria.academicYear,
                    isShowInAccounting: false,
                });

                console.log(
                    "criteria.currentDate, criteria.currentDate,feesData",
                    feesData.length
                );
                const currentDateValue = criteria.currentDate
                    ? criteria.currentDate
                    : null;
                // console.log(currentDateValue);
                const currentDateObj = currentDateValue
                    ? new Date(currentDateValue)
                    : null;

                if (currentDateObj) {
                    const year = currentDateObj.getFullYear();
                    const month = String(
                        currentDateObj.getMonth() + 1
                    ).padStart(2, "0");
                    const day = String(currentDateObj.getDate()).padStart(
                        2,
                        "0"
                    );
                    const formattedDate = `${year}/${month}/${day}`;

                    feesData = feesData.filter(
                        (fee) => fee.currentDate === formattedDate
                    );
                }
                if (criteria.startDate && criteria.endDate) {
                    feesData = feesData.filter((fee) => {
                        return (
                            fee.currentDate >= criteria.startDate &&
                            fee.currentDate <= criteria.endDate
                        );
                    });
                }

                if (criteria.month) {
                    query.month = criteria.month;
                    const month = query.month.padStart(2, "0");
                    feesData = feesData.filter((data) => {
                        const currentDate = new Date(data.currentDate);
                        const dataMonth = String(
                            currentDate.getMonth() + 1
                        ).padStart(2, "0");
                        return dataMonth === month;
                    });
                }

                if (criteria.academicYear) {
                    query.academicYear = criteria.academicYear;
                    feesData = feesData.filter(
                        (data) => data.academicYear === query.academicYear
                    );
                }

                if (criteria.location) {
                    query.location = criteria.location;
                    admissionData = admissionData.filter(
                        (data) => data.location == query.location
                    );
                }

                if (criteria.department) {
                    query.department = criteria.department;
                    admissionData = admissionData.filter((data) => {
                        if (
                            data.courseDetails &&
                            data.courseDetails.length > 0
                        ) {
                            let matchingdepartment = data.courseDetails.some(
                                (departments) =>
                                    departments.department_id &&
                                    departments.department_id.toString() ===
                                        query.department.toString()
                            );
                            return matchingdepartment;
                        }
                        return false;
                    });
                }
                if (criteria.feesTemplateId) {
                    query.feesTemplateId = criteria.feesTemplateId;
                    admissionData = admissionData.filter((data) => {
                        if (data.feesDetails && data.feesDetails.length > 0) {
                            let matchingfeesTemplateId = data.feesDetails.some(
                                (feesTemplate) =>
                                    feesTemplate.feesTemplateId &&
                                    feesTemplate.feesTemplateId.toString() ===
                                        query.feesTemplateId.toString()
                            );
                            return matchingfeesTemplateId;
                        }
                        return false;
                    });
                }
                if (criteria.course) {
                    query.course = criteria.course;
                    admissionData = admissionData.filter((data) => {
                        if (
                            data.courseDetails &&
                            data.courseDetails.length > 0
                        ) {
                            const matchingCourses = data.courseDetails.some(
                                (course) =>
                                    course.course_id &&
                                    course.course_id.toString() ===
                                        query.course.toString()
                            );
                            // console.log("matchingCourses", matchingCourses);
                            return matchingCourses;
                        }
                        return false;
                    });
                }

                if (criteria.class) {
                    query.class = criteria.class;
                    admissionData = admissionData.filter((data) => {
                        if (
                            data.courseDetails &&
                            data.courseDetails.length > 0
                        ) {
                            let matchingclasses = data.courseDetails.some(
                                (classes) =>
                                    classes.class_id &&
                                    classes.class_id.toString() ===
                                        query.class.toString()
                            );
                            return matchingclasses;
                        }
                        return false;
                    });
                }

                if (criteria.division) {
                    query.division = criteria.division;
                    admissionData = admissionData.filter((data) => {
                        if (
                            data.courseDetails &&
                            data.courseDetails.length > 0
                        ) {
                            let matchingdivision = data.courseDetails.some(
                                (divisions) =>
                                    divisions.division_id &&
                                    divisions.division_id.toString() ===
                                        query.division.toString()
                            );
                            return matchingdivision;
                        }
                        return false;
                    });
                }

                let coursePayments = {};
                courseData.forEach((course) => {
                    courseID = course.courseId;
                    courseFee = course.Fees;
                    coursePayments[course.CourseName] = {
                        totalPaidAmount: 0,
                        totalRemainingAmount: 0,
                        courseId: courseID,
                        courseFee: courseFee,
                    };
                });

                admissionData.forEach((admission) => {
                    if (
                        admission.courseDetails &&
                        admission.courseDetails.length > 0
                    ) {
                        admission.courseDetails.forEach((courseDetail) => {
                            const courseId = courseDetail?.course_id;

                            const courseExists = courseData.find(
                                (course) => course.courseId === courseId
                            );

                            if (courseExists) {
                                const courseName = courseExists.CourseName;

                                const paymentsForCourse = feesData.filter(
                                    (payment) =>
                                        payment.addmissionId ===
                                        admission.addmissionId
                                );
                                const paidAmountForCourse =
                                    paymentsForCourse.reduce(
                                        (total, payment) =>
                                            total +
                                            parseFloat(payment.paidAmount || 0),
                                        0
                                    );

                                const remainingAmountForCourse =
                                    paymentsForCourse.reduce(
                                        (total, paymentArray, currentIndex) => {
                                            const lastIndex =
                                                currentIndex ===
                                                paymentsForCourse.length - 1
                                                    ? paymentArray
                                                    : null;

                                            const remainingAmount = lastIndex
                                                ? parseFloat(
                                                      lastIndex.remainingAmount ||
                                                          0
                                                  )
                                                : 0;

                                            return total + remainingAmount;
                                        },
                                        0
                                    );

                                if (!coursePayments[courseName].noOfStudents) {
                                    coursePayments[courseName].noOfStudents = 0;
                                }
                                coursePayments[courseName].noOfStudents++;

                                if (!coursePayments[courseName].courseId) {
                                    coursePayments[courseName].courseId =
                                        courseID;
                                }
                                if (!coursePayments[courseName].courseFee) {
                                    coursePayments[courseName].courseFee =
                                        courseFee;
                                }

                                coursePayments[courseName].totalPaidAmount +=
                                    paidAmountForCourse;

                                coursePayments[
                                    courseName
                                ].totalRemainingAmount +=
                                    remainingAmountForCourse;
                            }
                        });
                    }
                });
                let formattedCoursePayments = Object.keys(coursePayments).map(
                    (courseName) => {
                        console.log(courseName);
                        let lastPaymentPerAdmission = {};

                        let totalFee = 0;

                        admissionData.forEach((admission) => {
                            const admissionId = admission.addmissionId;

                            const correspondingPayment = feesData.find(
                                (payment) =>
                                    payment.addmissionId === admissionId
                            );

                            if (
                                correspondingPayment &&
                                correspondingPayment.courseName === courseName
                            ) {
                                totalFee += correspondingPayment.courseFee;
                            }
                        });

                        console.log(
                            "Total fee for course '" +
                                courseName +
                                "': " +
                                totalFee
                        );

                        return {
                            name: courseName,
                            courseId: coursePayments[courseName].courseId,
                            courseFee: totalFee,
                            TotalCourseFee:
                                coursePayments[courseName].courseFee *
                                    coursePayments[courseName].noOfStudents ||
                                0,
                            noOfStudents:
                                coursePayments[courseName].noOfStudents || 0,
                            totalPaidAmount:
                                coursePayments[courseName].totalPaidAmount,
                            totalRemainingAmount:
                                coursePayments[courseName].totalRemainingAmount,
                        };
                    }
                );
                let totalPaidAmount = 0;
                let totalRemainingAmount = 0;
                let totalCourseFee = 0;
                let totalCourseFee1 = 0;
                formattedCoursePayments.forEach((course) => {
                    totalPaidAmount += course.totalPaidAmount || 0;
                    totalRemainingAmount += course.totalRemainingAmount || 0;
                });

                totalCourseFee = formattedCoursePayments.reduce(
                    (total, course) => {
                        return total + parseFloat(course.courseFee || 0);
                    },
                    0
                );
                let response = {
                    coursePayments: formattedCoursePayments,
                    totalItemsCount: admissionData.length,
                    totalFees: totalPaidAmount + totalRemainingAmount || 0,
                    totalPaidFees: totalPaidAmount,
                    totalPendingFees: totalRemainingAmount,
                };

                return response;
            } catch (error) {
                console.error("Error occurred:", error);
                throw error;
            }
        });
    }
    async getByAdmissionAndEmpId(addmissionId, feesDetailsId, empId) {
        return this.execute(() => {
            return this.model
                .findOne({
                    addmissionId: addmissionId,
                    feesDetailsId: feesDetailsId,
                    empId: empId,
                })
                .sort({ _id: -1 });
        });
    }

    async getPaymentData(groupId, addmissionId, isShowInAccounting) {
        try {
            const addmissionIdArray = Array.isArray(addmissionId)
                ? addmissionId
                : [addmissionId];

            const pipeline = [
                {
                    $match: {
                        groupId: Number(groupId),
                        addmissionId: { $in: addmissionIdArray.map(Number) },
                        isShowInAccounting: true,
                    },
                },
                {
                    $group: {
                        _id: "$addmissionId",
                        lastRecord: { $last: "$$ROOT" },
                        paidAmount: { $sum: { $toDouble: "$paidAmount" } },
                    },
                },
            ];

            const paymentData = await this.model.aggregate(pipeline);

            return paymentData[0].paidAmount;
        } catch (error) {
            console.error("Error fetching payment data:", error);
            throw error;
        }
    }

    async getByfeesPaymentId(groupId, feesPaymentId) {
        return this.execute(async () => {
            let feesdata = {};
            let course_id;
            let class_id;
            let feesTemplateId;
            let academicYearId;
            const feesPaymentData = await this.model.findOne({
                groupId: groupId,
                feesPaymentId: feesPaymentId,
            });

            if (feesPaymentData) {
                const addmissionId = feesPaymentData.addmissionId;
                if (addmissionId) {
                    const addmissionId1 = await StudentsAdmissionModel.findOne({
                        groupId: groupId,
                        addmissionId: addmissionId,
                    });
                    feesdata.addmissionId = addmissionId1;
                    academicYearId = addmissionId1.academicYear;
                    let courseIds = addmissionId1.courseDetails.forEach(
                        (element) => {
                            course_id = element.course_id;
                            class_id = element.class_id;
                        }
                    );
                    let templateIds = addmissionId1.feesDetails.forEach(
                        (element) => {
                            feesTemplateId = element.feesTemplateId;
                        }
                    );

                    let courseAdditionalData = {};

                    let courseDetails = await courseModel.findOne({
                        groupId: groupId,
                        courseId: course_id,
                    });
                    let classDetails = await ClassModel.findOne({
                        groupId: groupId,
                        classId: class_id,
                    });
                    let feesTemplateIds = await feesTemplateModel.findOne({
                        groupId: groupId,
                        feesTemplateId: feesTemplateId,
                    });
                    let academicYearIds = await AcademicYearModel.findOne({
                        groupId: groupId,
                        academicYearId: academicYearId,
                    });
                    console.log(academicYearIds, academicYearId);
                    courseAdditionalData.course_id = courseDetails;
                    courseAdditionalData.class_id = classDetails;
                    courseAdditionalData.feesTemplateId = feesTemplateIds;
                    courseAdditionalData.academicYearId = academicYearIds;

                    return {
                        ...courseAdditionalData,
                        ...feesPaymentData._doc,
                        ...feesdata,
                    };
                }
            }
            return null;
        });
    }

    async updatePaidAmountInDatabase(
        feesPaymentId,
        totalPaidAmount,
        remainingAmount
    ) {
        try {
            const feesPayment = await feesPaymentModel.findOne({
                feesPaymentId: feesPaymentId,
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

    getAllFeesPaymentByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.feesPaymentId)
            query.feesPaymentId = criteria.feesPaymentId;
        if (criteria.empId) query.empId = criteria.empId;
        if (criteria.userId) query.userId = criteria.userId;
        if (criteria.installmentId)
            query.installmentId = criteria.installmentId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteFeesPaymentById(feesPaymentId, groupId) {
        try {
            return await feesPaymentModel.deleteOne(feesPaymentId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateFeesPaymentById(feesPaymentId, groupId, newData) {
        try {
            const updateFeesPayment = await feesPaymentModel.findOneAndUpdate(
                { feesPaymentId: feesPaymentId, groupId: groupId },
                newData,
                { new: true }
            );
            return updateFeesPayment;
        } catch (error) {
            throw error;
        }
    }

    getAllFeesPaymentByStudentId(studentId, criteria) {
        const query = {
            studentId: studentId,
        };
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async calculateTotalFeeAndRemaining(groupId, admissionId) {
        try {
            const installments = await FeesInstallmentModel.find({
                groupId: groupId,
                addmissionId: admissionId,
            });

            let totalFee = 0;
            let remeningAmount = 0;
            let totalPaid = 0;
            installments.forEach((installment) => {
                installment.feesDetails.forEach((feesDetail) => {
                    feesDetail.installment.forEach((installmentItem) => {
                        totalFee += installmentItem.amount;
                        if (installmentItem.status === "pending") {
                            remeningAmount += installmentItem.amount;
                        } else if (installmentItem.status === "paid") {
                            totalPaid += parseInt(installmentItem.amount);
                        }
                    });
                });
            });
            let books = await bookIssueLogService.getIssueBooks(admissionId);
            console.log(books);
            return {
                totalFee: totalFee,
                remeningAmount: remeningAmount,
                totalPaid: totalPaid,
                books: books,
            };
        } catch (error) {
            console.error(
                "Error calculating total fee and remaining amounts:",
                error
            );
            throw error;
        }
    }

    async getPaidAmount(groupId, addmissionId) {
        try {
            const paidamount = await feesPaymentModel.find({
                groupId: groupId,
                addmissionId: addmissionId,
                isShowInAccounting: true,
            });
            return paidamount;
        } catch (err) {
            throw err;
        }
    }

    async getClassNames(groupId, userId) {
        try {
            const classNames = await feesPaymentModel.distinct("className", {
                groupId: groupId,
                userId: userId,
                isShowInAccounting: true,
            });
            return classNames;
        } catch (err) {
            throw err;
        }
    }

    async getPaymentDetails(groupId, userId, className) {
        try {
            const paidAmount = await feesPaymentModel.find({
                groupId: groupId,
                userId: userId,
                className: className,
                isShowInAccounting: true,
            });
            return paidAmount;
        } catch (err) {
            throw err;
        }
    }
}
module.exports = new feesPaymentService(feesPaymentModel, "FeesPayment");
