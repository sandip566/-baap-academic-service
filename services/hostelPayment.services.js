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
        if (criteria.hostelInstallmentId) query.hostelInstallmentId = criteria.hostelInstallmentId;
        if (criteria.memberId) query.memberId = criteria.memberId;
        if (criteria.hostelId) query.hostelId = criteria.hostelId;
        return this.preparePaginationAndReturnData(query, criteria);
    }
    async getHostelStatastics(groupId, criteria, page, limit) {
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
                if (criteria.hostelId) {
                    matchStage["hostelDetails.hostelId"] = Number(
                        criteria.hostelId
                    );
                }
                if (criteria.roomId) {
                    matchStage["hostelDetails.roomId"] = Number(
                        criteria.roomId
                    );
                }

                if (criteria.bedId) {
                    matchStage["hostelDetails.bedId"] = Number(
                        criteria.bedId
                    );
                }

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

    async getHostelFeesTotalCount(groupId, criteria, page, limit) {
        return this.execute(async () => {
            try {
                const skip = (page - 1) * limit;

                const query = {
                    groupId: groupId,
                };

                let courseData = await hostelPremisesModel.find({
                    groupId: groupId,
                });
                let hostelId;
                let courseFee;
                let admissionData = await HostelAdmissionModel.find({
                    groupId: groupId,
                    // academicYear: criteria.academicYear,
                    admissionStatus: "Confirm",
                });
                console.log(admissionData);
                let feesData = await this.model.find({
                    groupId: groupId,
                    // academicYear: criteria.academicYear,
                    // isShowInAccounting: true,
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
                if (criteria.hostelId) {
                    query.hostelId = criteria.hostelId;
                    admissionData = admissionData.filter((data) => {
                        if (
                            data.hostelDetails &&
                            data.hostelDetails.length > 0
                        ) {
                            const matchingCourses = data.hostelDetails.some(
                                (course) =>
                                    course.hostelId &&
                                    course.hostelId.toString() ===
                                        query.hostelId.toString()
                            );
                            // console.log("matchingCourses", matchingCourses);
                            return matchingCourses;
                        }
                        return false;
                    });
                }

                if (criteria.roomId) {
                    query.roomId = criteria.roomId;
                    admissionData = admissionData.filter((data) => {
                        if (
                            data.hostelDetails &&
                            data.hostelDetails.length > 0
                        ) {
                            let matchingclasses = data.hostelDetails.some(
                                (classes) =>
                                    classes.roomId &&
                                    classes.roomId.toString() ===
                                        query.roomId.toString()
                            );
                            return matchingclasses;
                        }
                        return false;
                    });
                }

                if (criteria.bedId) {
                    query.bedId = criteria.bedId;
                    admissionData = admissionData.filter((data) => {
                        if (
                            data.hostelDetails &&
                            data.hostelDetails.length > 0
                        ) {
                            let matchingdivision = data.hostelDetails.some(
                                (divisions) =>
                                    divisions.bedId &&
                                    divisions.bedId.toString() ===
                                        query.bedId.toString()
                            );
                            return matchingdivision;
                        }
                        return false;
                    });
                }

                let coursePayments = {};
                courseData.forEach((course) => {
                    hostelId = course.hostelId;
                    // courseFee = course.Fees;
                    coursePayments[course.hostelName] = {
                        totalPaidAmount: 0,
                        totalRemainingAmount: 0,
                        hostelId: hostelId,
                        // courseFee: courseFee,
                    };
                });

                admissionData.forEach((admission) => {
                    if (
                        admission.hostelDetails &&
                        admission.hostelDetails.length > 0
                    ) {
                        admission.hostelDetails.forEach((courseDetail) => {
                            const hostelId = courseDetail?.hostelId;

                            const courseExists = courseData.find(
                                (course) => course.hostelId === hostelId
                            );
                            console.log("courseExists", courseExists);
                            if (courseExists) {
                                const hostelName = courseExists.hostelName;

                                const paymentsForCourse = feesData.filter(
                                    (payment) =>
                                        payment.hostelAdmissionId ===
                                        admission.hostelAdmissionId
                                );
                                console.log(
                                    "paymentsForCourse",
                                    paymentsForCourse
                                );
                                const paidAmountForCourse =
                                    paymentsForCourse.reduce(
                                        (total, payment) =>
                                            total +
                                            parseFloat(payment.paidAmount || 0),
                                        0
                                    );
                                console.log(
                                    "paidAmountForCourse",
                                    paidAmountForCourse
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

                                if (!coursePayments[hostelName].noOfStudents) {
                                    coursePayments[hostelName].noOfStudents = 0;
                                }
                                coursePayments[hostelName].noOfStudents++;

                                if (!coursePayments[hostelName].hostelId) {
                                    coursePayments[hostelName].hostelId =
                                        hostelId;
                                }
                                // if (!coursePayments[courseName].courseFee) {
                                //     coursePayments[courseName].courseFee =
                                //         courseFee;
                                // }

                                coursePayments[hostelName].totalPaidAmount +=
                                    paidAmountForCourse;

                                coursePayments[
                                    hostelName
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
                            const hostelAdmissionId =
                                admission.hostelAdmissionId;

                            const correspondingPayment = feesData.find(
                                (payment) =>
                                    payment.hostelAdmissionId ===
                                    hostelAdmissionId
                            );

                            if (
                                correspondingPayment &&
                                correspondingPayment.hostelName === courseName
                            ) {
                                totalFee += correspondingPayment.hostelFee;
                            }
                            console.log(totalFee);
                        });

                        console.log(
                            "Total fee for course '" +
                                courseName +
                                "': " +
                                totalFee
                        );

                        return {
                            name: courseName,
                            courseId: coursePayments[courseName].hostelId,
                            courseFee: totalFee,
                            TotalCourseFee:
                                coursePayments[courseName].hostelFee *
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
