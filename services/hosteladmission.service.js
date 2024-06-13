const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const HostelAdmissionModel = require("../schema/hosteladmission.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const HostelFeesInstallmentModel = require("../schema/hostelfeesinstallment.schema");
const CategoriesModel = require("../schema/categories.schema");
const religionModel = require("../schema/religion.schema");
const feesTemplateModel = require("../schema/feesTemplate.schema");
const hostelPaymentModel = require("../schema/hostelPayment.schema");
const courseModel = require("../schema/courses.schema");
const hostelPremises = require("../schema/hostelPremises.schema")
const { aggregate } = require("../schema/feesPayment.schema");

class HostelAdmissionService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getAllDataByGroupId(
        groupId,
        query,
        page,
        limit,
        reverseOrder = true
    ) {
        try {
            const searchFilter = {
                groupId: Number(groupId),
            };

            if (query.search) {
                const numericSearch = parseInt(query.search);
                if (!isNaN(numericSearch)) {
                    searchFilter.$or = [
                        { firstName: { $regex: query.search, $options: "i" } },
                        { lastName: { $regex: query.search, $options: "i" } },
                        { phoneNumber: numericSearch },
                        { hostelAdmissionId: numericSearch },
                    ];
                } else {
                    searchFilter.$or = [
                        { firstName: { $regex: query.search, $options: "i" } },
                        { lastName: { $regex: query.search, $options: "i" } },
                    ];
                }
            }

            if (query.phoneNumber) {
                searchFilter.phoneNumber = query.phoneNumber;
            }

            if (query.academicYear) {
                searchFilter.academicYear = query.academicYear;
            }

            if (query.roleId) {
                searchFilter.roleId = query.roleId;
            }

            if (query.firstName) {
                searchFilter.firstName = {
                    $regex: query.firstName,
                    $options: "i",
                };
            }

            if (query.lastName) {
                searchFilter.lastName = {
                    $regex: query.lastName,
                    $options: "i",
                };
            }

            if (query.admissionStatus) {
                searchFilter.admissionStatus = {
                    $regex: query.admissionStatus,
                    $options: "i",
                };
            }

            if (query.status) {
                searchFilter.status = {
                    $regex: query.status,
                    $options: "i",
                };
            }

            // const skip = (page - 1) * perPage;
            // const limit = perPage;
            const currentPage = page;
            const perPage = limit;
            const skip = (currentPage - 1) * perPage;

            const data = await HostelAdmissionModel.aggregate([
                { $match: searchFilter },
                { $unwind: { path: "$feesDetails", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "feestemplates",
                        localField: "feesDetails.feesTemplateId",
                        foreignField: "feesTemplateId",
                        as: "feesTemplateDetails",
                    },
                },
                { $unwind: { path: "$feesTemplateDetails", preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: "$_id",
                        doc: { $first: "$$ROOT" },
                        feesDetails: {
                            $push: {
                                feesTemplateId: "$feesDetails.feesTemplateId",
                                installment: "$feesDetails.installment",
                                feesDetailsId: "$feesDetails.feesDetailsId",
                                status: "$feesDetails.status",
                                hostelFeesDetailsId: "$feesDetails.hostelFeesDetailsId",
                                feesTemplateDetails: "$feesTemplateDetails",
                            },
                        },
                    },
                },
                {
                    $replaceRoot: {
                        newRoot: {
                            $mergeObjects: [
                                "$doc",
                                { feesDetails: "$feesDetails" },
                            ],
                        },
                    },
                },
                { $unwind: { path: "$hostelDetails", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "hostelpremises",
                        localField: "hostelDetails.hostelId",
                        foreignField: "hostelId",
                        as: "hostelDetails.hostelId",
                    },
                },
                { $unwind: { path: "$hostelDetails.hostelId", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "roooms",
                        localField: "hostelDetails.roomId",
                        foreignField: "roomId",
                        as: "hostelDetails.roomId",
                    },
                },
                { $unwind: { path: "$hostelDetails.roomId", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "beds",
                        localField: "hostelDetails.bedId",
                        foreignField: "bedId",
                        as: "hostelDetails.bedId",
                    },
                },
                { $unwind: { path: "$hostelDetails.bedId", preserveNullAndEmptyArrays: true } },
                { $sort: { createdAt: reverseOrder ? -1 : 1 } },
                { $skip: skip },
                { $limit: perPage },
            ]).exec();


            const totalItemsCount = await HostelAdmissionModel.countDocuments(
                searchFilter
            );

            const response = {
                status: "Success",
                data: {
                    items: data,
                    totalItemsCount: totalItemsCount,
                },
            };
            return response;
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }
    async getTotalCount(groupId, query) {
        try {
            const searchFilter = {
                groupId: Number(groupId),
                admissionStatus: { $regex: "Confirm", $options: "i" },
            };

            if (query.admissionStatus) {
                searchFilter.admissionStatus = {
                    $regex: query.admissionStatus,
                    $options: "i",
                };
            }

            if (query.status) {
                searchFilter.status = {
                    $regex: query.status,
                    $options: "i",
                };
            }

            if (query.academicYear) {
                searchFilter.academicYear = query.academicYear;
            }

            const data = await HostelAdmissionModel.aggregate([
                { $match: searchFilter },
                {
                    $group: {
                        _id: { $toLower: "$gender" },
                        count: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        gender: "$_id",
                        count: 1,
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalBoys: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$gender", "male"] },
                                    "$count",
                                    0,
                                ],
                            },
                        },
                        totalGirls: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$gender", "female"] },
                                    "$count",
                                    0,
                                ],
                            },
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        totalBoys: 1,
                        totalGirls: 1,
                    },
                },
            ]).exec();

            const response = {
                data: [
                    { totalBoys: data[0] ? data[0].totalBoys : 0 },
                    { totalGirls: data[0] ? data[0].totalGirls : 0 },
                ],
            };
            return response;
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }
    async getByAddmissionId(hostelAdmissionId) {
        try {
            const studentAdmission = await this.model.findOne({
                hostelAdmissionId: hostelAdmissionId,
            });
            console.log(studentAdmission);
            if (!studentAdmission) {
                throw new Error("Student admission not found");
            }

            let additionalData = {};

            // Process fees details
            if (
                studentAdmission.feesDetails &&
                studentAdmission.feesDetails.length > 0
            ) {
                additionalData.feesDetails = await Promise.all(
                    studentAdmission.feesDetails.map(async (feesDetail) => {
                        let feesAdditionalData = {};

                        if (feesDetail.feesTemplateId) {
                            const feesTemplate =
                                await feesTemplateModel.findOne({
                                    feesTemplateId: feesDetail.feesTemplateId,
                                });
                            feesAdditionalData.feesTemplateId = feesTemplate;
                        }

                        return { ...feesDetail, ...feesAdditionalData };
                    })
                );
            }
            let response = {
                status: "success",
                data: { ...studentAdmission._doc, ...additionalData },
            };
            return response;
        } catch (error) {
            throw error;
        }
    }
    async getAdmissionListing(groupId) {
        console.log(groupId);
        try {
            let pipeLine = await hostelPremises.aggregate([
                {
                    $match: { groupId: Number(groupId) }
                },
                {
                    $project: { _id: 0, hostelId: 1, hostelName: 1 }
                },
                {
                    $lookup: {
                        from: "hosteladmissions",
                        let: { hostelId: "$hostelId" },
                        pipeline: [
                            // { $match: { academicYear: academicYear } },
                            { $unwind: "$hostelDetails" },
                            { $match: { $expr: { $eq: ["$hostelDetails.hostelId", "$$hostelId"] } } },
                            { $group: { _id: "$hostelDetails.hostelId", studentCount: { $sum: 1 } } }
                        ],
                        as: "hostelStudentCount"
                    }
                },
                {
                    $unwind: {
                        path: "$hostelStudentCount",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: { hostelId: "$hostelId", hostelName: "$hostelName" },
                        totalStudents: { $sum: { $ifNull: ["$hostelStudentCount.studentCount", 0] } }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        hostelId: "$_id.hostelId",
                        hostelName: "$_id.hostelName",
                        totalStudents: 1
                    }
                },
                {
                    $sort: { hostelId: 1 }
                }
            ]);
            let response = {
                status: "success",
                data: pipeLine
            }
            return response;
        } catch (error) {
            console.error(error);
            throw new Error("Error getting admission listing");
        }
    }
    async getIndividualStudentData(groupId, query) {
        try {
            const userId = Number(query.userId);

            let data = await HostelAdmissionModel.aggregate([
                {
                    $match: {
                        groupId: Number(groupId),
                        userId: userId
                    }
                },
                {
                    $unwind: { path: "$feesDetails", preserveNullAndEmptyArrays: true }
                },
                {
                    $lookup: {
                        from: "feestemplates",
                        localField: "feesDetails.feesTemplateId",
                        foreignField: "feesTemplateId",
                        as: "feesDetails.feesTemplateId"
                    }
                },
                {
                    $unwind: { path: "$feesDetails.feesTemplateId", preserveNullAndEmptyArrays: true }
                },
                {
                    $unwind: { path: "$hostelDetails", preserveNullAndEmptyArrays: true }
                },
                {
                    $lookup: {
                        from: "hostels",
                        localField: "hostelDetails.hostelId",
                        foreignField: "hostelId",
                        as: "hostelDetails.hostelId"
                    }
                },
                {
                    $unwind: { path: "$hostelDetails.hostelId", preserveNullAndEmptyArrays: true }
                },
                {
                    $lookup: {
                        from: "beds",
                        localField: "hostelDetails.bedId",
                        foreignField: "bedId",
                        as: "hostelDetails.bedId"
                    }
                },
                {
                    $unwind: { path: "$hostelDetails.bedId", preserveNullAndEmptyArrays: true }
                },
                {
                    $lookup: {
                        from: "rooms",
                        localField: "hostelDetails.roomId",
                        foreignField: "roomId",
                        as: "hostelDetails.roomId"
                    }
                },
                {
                    $unwind: { path: "$hostelDetails.roomId", preserveNullAndEmptyArrays: true }
                },
                {
                    $group: {
                        _id: "$_id",
                        groupId: { $first: "$groupId" },
                        userId: { $first: "$userId" },
                        academicYear: { $first: "$academicYear" },
                        hostelAdmissionId: { $first: "$hostelAdmissionId" },
                        roleId: { $first: "$roleId" },
                        location: { $first: "$location" },
                        phoneNumber: { $first: "$phoneNumber" },
                        admissionStatus: { $first: "$admissionStatus" },
                        dateOfBirth: { $first: "$dateOfBirth" },
                        profile_img: { $first: "$profile_img" },
                        title: { $first: "$title" },
                        firstName: { $first: "$firstName" },
                        middleName: { $first: "$middleName" },
                        lastName: { $first: "$lastName" },
                        gender: { $first: "$gender" },
                        religion: { $first: "$religion" },
                        caste: { $first: "$caste" },
                        email: { $first: "$email" },
                        password: { $first: "$password" },
                        name: { $first: "$name" },
                        empId: { $first: "$empId" },
                        createdAt: { $first: "$createdAt" },
                        updatedAt: { $first: "$updatedAt" },
                        __v: { $first: "$__v" },
                        hostelDetails: { $push: "$hostelDetails" },
                        feesDetails: { $push: "$feesDetails" },
                        installmentId: { $first: "$installmentId" },
                        status: { $first: "$status" }
                    }
                },
                {
                    $lookup: {
                        from: "hostelpayments",
                        let: { hostelAdmissionId: "$hostelAdmissionId", userId: "$userId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$hostelAdmissionId", "$$hostelAdmissionId"] },
                                            { $eq: ["$userId", "$$userId"] },
                                        ]
                                    }
                                }
                            },
                            {
                                $sort: { createdAt: -1 } // Sorting by createdAt to get the latest record
                            }
                        ],
                        as: "feespayments"
                    }
                },
                {
                    $addFields: {
                        totalPaidAmount: {
                            $toInt: {
                                $sum: {
                                    $map: {
                                        input: "$feespayments",
                                        as: "payment",
                                        in: { $toDouble: "$$payment.paidAmount" }
                                    }
                                }
                            }
                        },
                        lastRemainingAmount: {
                            $toInt: {
                                $ifNull: [
                                    { $arrayElemAt: ["$feespayments.remainingAmount", -1] },
                                    0
                                ]
                            }
                        }
                    }
                }
            ]);

            const response = {
                status: "Success",
                data: {
                    items: data,
                    totalItemsCount: data.length,
                },
            };

            return response;
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }


    async updateFeesInstallmentById(hostelInstallmentId, newFeesDetails, newData) {
        try {
            const updateResult = await HostelAdmissionModel.findOneAndUpdate(
                { hostelInstallmentId: hostelInstallmentId },
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
                        addmissionId: 1,
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

            console.log("Pipeline:", JSON.stringify(pipeline)); // Log the pipeline

            const result = await HostelAdmissionModel.aggregate(pipeline);

            console.log("Result:", result); // Log the result

            return result;
        } catch (error) {
            console.error("Error retrieving pending installment:", error);
            throw error;
        }
    }
    async getByInstallmentId(hostelInstallmentId) {
        return this.execute(() => {
            return this.model.findOne({ hostelInstallmentId: hostelInstallmentId });
        });
    }
    async getfeesPayment(groupId, query) {
        try {
            const searchFilter = {
                groupId: groupId,
            };

            if (query.search) {
                const numericSearch = parseInt(query.search);
                if (!isNaN(numericSearch)) {
                    searchFilter.$or = [
                        { firstName: { $regex: query.search, $options: "i" } },
                        { lastName: { $regex: query.search, $options: "i" } },
                        { phoneNumber: numericSearch },
                    ];
                } else {
                    searchFilter.$or = [
                        { firstName: { $regex: query.search, $options: "i" } },
                        { lastName: { $regex: query.search, $options: "i" } },
                    ];
                }
            }

            if (query.phoneNumber) {
                searchFilter.phoneNumber = query.phoneNumber;
            }

            if (query.hostelAdmissionId) {
                searchFilter.hostelAdmissionId = query.hostelAdmissionId;
            }
            if (query.academicYear) {
                searchFilter.academicYear = query.academicYear;
            }
            if (query.firstName) {
                searchFilter.firstName = {
                    $regex: query.firstName,
                    $options: "i",
                };
            }

            if (query.lastName) {
                searchFilter.lastName = {
                    $regex: query.lastName,
                    $options: "i",
                };
            }
            const services = await HostelAdmissionModel.find(searchFilter);
            const servicesWithData = await Promise.all(
                services.map(async (service) => {
                    let categoryData;
                    let religionData;
                    let additionalData = {};

                    if (service.caste) {
                        categoryData = await CategoriesModel.findOne({
                            categoriseId: service.caste,
                        });
                        additionalData.caste = categoryData;
                    }

                    if (service.religion) {
                        try {
                            const religionData = await religionModel.findOne({
                                religionId: service.religion,
                            });

                            additionalData.religion = religionData;
                        } catch (error) {
                            console.error(
                                "Error fetching data from religionModel:",
                                error
                            );
                        }
                    }
                    // Process fees details
                    if (service.feesDetails && service.feesDetails.length > 0) {
                        const feesDetailsWithAdditionalData = await Promise.all(
                            service.feesDetails.map(async (feesDetail) => {
                                let feesAdditionalData = {};

                                let totalPendingInstallmentAmount = 0;

                                for (const installment of feesDetail.installment) {
                                    if (installment.status == "pending") {
                                        const amount = parseFloat(
                                            installment.amount
                                        );
                                        totalPendingInstallmentAmount += amount;
                                    }
                                }

                                if (feesDetail.feesTemplateId) {
                                    const feesTemplateId =
                                        await feesTemplateModel.findOne({
                                            feesTemplateId:
                                                feesDetail.feesTemplateId,
                                        });
                                    feesAdditionalData.feesTemplateId =
                                        feesTemplateId;
                                }

                                return {
                                    ...feesDetail,
                                    ...feesAdditionalData,
                                    totalPendingInstallmentAmount:
                                        totalPendingInstallmentAmount,
                                };
                            })
                        );

                        additionalData.feesDetails =
                            feesDetailsWithAdditionalData;
                    }

                    return { ...service._doc, ...additionalData };
                })
            );

            const feesPaymentData = await hostelPaymentModel.find({
                groupId: groupId,
                empId: query.empId,
                hostelAdmissionId: query.hostelAdmissionId,

            });

            // let response1;
            let modifiedFeesPaymentData = [];
            let response1 = [];

            for (const feesPayment of feesPaymentData) {
                try {
                    const addmissionData = await HostelAdmissionModel.findOne({
                        hostelAdmissionId: feesPayment.hostelAdmissionId,
                    });

                    if (addmissionData) {
                        const feesDetailsWithAdditionalData = [];

                        response1.push({
                            ...feesPayment._doc,
                        });
                        modifiedFeesPaymentData.push(
                            ...feesDetailsWithAdditionalData
                        );
                    }
                } catch (error) {
                    console.error(
                        "Error fetching data from studentAdmissionModel:",
                        error
                    );
                    modifiedFeesPaymentData.push(feesPayment);
                }
            }

            const filteredData = servicesWithData.filter((data) => {
                return (
                    data.groupId === parseInt(groupId) &&
                    data.empId === query.empId &&
                    data.academicYear == query.academicYear &&
                    data.hostelAdmissionId == query.hostelAdmissionId,
                    true
                );
            });

            const response = {
                status: "Success",
                data: {
                    items: filteredData,
                    feesPaymentData: response1,
                    totalItemsCount: filteredData.length,
                },
            };

            return response;
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }

    async getByHostelId(hostelAdmissionId) {
        try {
            const hostelAdmission = await HostelAdmissionModel.findOne({
                hostelAdmissionId: Number(hostelAdmissionId),
            }).exec();

            if (!hostelAdmission) {
                throw new Error("Hostel admission not found");
            }

            const feesDetails = hostelAdmission.feesDetails;
            if (!feesDetails || feesDetails.length === 0) {
                throw new Error("No fees details found in hostel admission");
            }

            const feesTemplateId = Number(feesDetails[0].feesTemplateId);
            if (!feesTemplateId) {
                throw new Error("Fee template ID not found in fees details");
            }

            const feeTemplate = await feesTemplateModel.findOne({
                feesTemplateId: feesTemplateId,
            }).exec();

            if (!feeTemplate) {
                throw new Error("Fee template not found");
            }
            return {
                status: "Success",
                data: {
                    hostelAdmission: hostelAdmission,
                    feeTemplate: feeTemplate
                }
            };
        } catch (error) {
            console.error("Error in getByHostelId:", error);
            return {
                status: "Error",
                message: error.message,
            };
        }
    }

    async getByAddmissionIdData(hostelAdmissionId, userId) {
        return this.execute(() => {
            return this.model.findOne({ hostelAdmissionId: hostelAdmissionId, userId: userId });
        });
    }
    async updateUser(hostelAdmissionId, groupId, data) {

        try {
            const resp = await HostelAdmissionModel.findOneAndUpdate(
                { hostelAdmissionId: hostelAdmissionId, groupId: groupId },

                data,
                { upsert: true, new: true }
            );

            return new ServiceResponse({
                data: resp,
            });
        } catch (error) {
            console.log(error);
            return new ServiceResponse({
                isError: true,
                message: error.message,
            });
        }
    }
    async updateDataById(hostelAdmissionId, groupId, newData) {
        try {
            const updatedData = await HostelAdmissionModel.findOneAndUpdate(
                { hostelAdmissionId: hostelAdmissionId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedData;
        } catch (error) {
            throw error;
        }
    }
    async updateInstallmentAmount(installmentId, newAmount, newStatus) {
        try {
            const updateResult = await HostelAdmissionModel.findOneAndUpdate(
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
                (installment) => installment.status == "paid"
            );

            if (allInstallmentsPaid) {
                await HostelAdmissionModel.findOneAndUpdate(
                    { "feesDetails.feesDetailsId": feesDetail.feesDetailsId },
                    { $set: { "feesDetails.$.status": "paid" } }
                );
            } else {
                await HostelAdmissionModel.findOneAndUpdate(
                    { "feesDetails.feesDetailsId": feesDetail.feesDetailsId },
                    { $set: { "feesDetails.$.status": "pending" } }
                );
            }
        } catch (error) {
            console.error("Error updating installment amount:", error);
        }
    }
    async deleteByStudentsAddmisionId(hostelAdmissionId, groupId) {
        try {
            const studentDeletionResult = await HostelAdmissionModel.deleteOne(
                {
                    hostelAdmissionId: hostelAdmissionId,
                    groupId: groupId,
                }
            );

            const feesDeletionResult = await HostelFeesInstallmentModel.deleteMany({
                hostelAdmissionId: hostelAdmissionId,
                groupId: groupId,
            });
            return {
                studentDeletionResult: studentDeletionResult,
                feesDeletionResult: feesDeletionResult,
            };
        } catch (error) {
            throw error;
        }
    }

    async deleteByDataId(hostelAdmissionId, groupId) {
        try {
            const deleteData = await HostelAdmissionModel.deleteOne({
                hostelAdmissionId: hostelAdmissionId,
                groupId: groupId,
            });
            return deleteData;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new HostelAdmissionService(
    HostelAdmissionModel,
    "hosteladmission"
);
