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
            let studentRecordCount = await StudentsAdmissionModel.find({
                groupId: groupId,
                academicYear: academicYear,
            });
            let totalPaidAmountCount = 0;
            let totalRemainingAmountCount = 0;
            let data = await this.model
                .find({
                    groupId: groupId,
                    academicYear: academicYear,
                    isShowInAccounting: true,
                })
                .skip(skip)
                .limit(limit)
                .exec();
            //const count = await .countDocuments(data);
            const totalPaidAmount = data.reduce((total, item) => {
                if (item.paidAmount) {
                    total += parseFloat(item.paidAmount);
                }
                return total;
            }, 0);

            const totalRemainingAmount = data.reduce((total, item) => {
                if (item.remainingAmount) {
                    total += parseFloat(item.remainingAmount);
                }
                return total;
            }, 0);

            console.log("Total Paid Amount:", totalPaidAmount);

            const servicesWithData = await Promise.all(
                data.map(async (service) => {
                    let additionalData = {};
                    let feesAdditionalData = {};

                    if (service.addmissionId) {
                        const feesTemplateId =
                            await StudentsAdmissionModel.findOne({
                                groupId: groupId,
                                addmissionId: service.addmissionId,
                            });
                        feesAdditionalData.addmissionId = feesTemplateId;
                        console.log(feesTemplateId);
                    }

                    additionalData.addmissionId = feesAdditionalData;
                    return { ...service._doc, ...additionalData.addmissionId };
                })
            );

            // Grouping services based on addmissionId and keeping only the last occurrence
            const groupedServices = {};

            servicesWithData.forEach((service) => {
                const addmissionId = service?.addmissionId?.addmissionId;
                const paidAmount = parseFloat(service.paidAmount) || 0;

                // Store the service data for each addmissionId
                groupedServices[addmissionId] = {
                    ...service,
                    paidAmount: paidAmount,
                };
            });

            // Filter only the last occurrence of each addmissionId
            const lastServices = {};

            servicesWithData.forEach((service) => {
                if (service.addmissionId && service.addmissionId.addmissionId) {
                    const addmissionId = service.addmissionId.addmissionId;
                    const paidAmount = parseFloat(service.paidAmount) || 0;

                    // Update or initialize the entry for the current addmissionId with the latest service data
                    lastServices[addmissionId] = {
                        ...service,
                        paidAmount:
                            (lastServices[addmissionId]?.paidAmount || 0) +
                            paidAmount,
                    };
                }
            });

            const finalServices = Object.values(lastServices);
            totalPaidAmountCount = finalServices.reduce((total, course) => {
                return total + parseFloat(course.paidAmount || 0);
            }, 0);

            totalRemainingAmountCount = finalServices.reduce(
                (total, course) => {
                    return total + parseFloat(course.remainingAmount || 0);
                },
                0
            );

            let response = {
                totalPaidAmount: totalPaidAmountCount,
                totalRemainingAmount: totalRemainingAmountCount,
                // feesDefaulter: data,
                //count:count,
                servicesWithData: finalServices,
                StudentRecords: studentRecordCount.length,
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
                let admissionData = await StudentsAdmissionModel.find({
                    groupId: groupId,
                    status: "Confirm",
                });

                let feesData = await this.model
                    .find({ groupId: groupId, isShowInAccounting: true })
                    .skip(skip)
                    .limit(limit);

                // console.log(criteria.currentDate, criteria.currentDate);
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
                // console.log("ssssssssssssssssssss", admissionData);
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

                let totalFeesData =
                    await feesInstallmentServices.getTotalFeesAndPendingFees(
                        groupId,
                        criteria.feesTemplateId,
                        criteria.academicYear
                    );
                // console.log(totalFeesData);
                let course_id;
                let class_id;
                let division_id;
                let divisionDoc;
                let classDoc;
                let a;
                let addmissionId;

                const servicesWithData = await Promise.all(
                    feesData?.map(async (service) => {
                        let additionalData = {};
                        let feesAdditionalData = {};

                        if (
                            service.addmissionId &&
                            service.isShowInAccounting
                        ) {
                            const matchingAdmission = admissionData.find(
                                (admission) =>
                                    admission.addmissionId ===
                                    service.addmissionId &&
                                    service.isShowInAccounting
                            );

                            if (matchingAdmission) {
                                await Promise.all(
                                    matchingAdmission.courseDetails.map(
                                        async (admission) => {
                                            if (admission?.course_id) {
                                                course_id =
                                                    await courseModel.findOne({
                                                        courseId:
                                                            admission.course_id,
                                                    });
                                                admission.course_id = course_id;
                                            }

                                            if (admission?.class_id) {
                                                classDoc =
                                                    await ClassModel.findOne({
                                                        classId:
                                                            admission.class_id,
                                                    });
                                                if (classDoc) {
                                                    class_id = classDoc.classId;
                                                    // console.log(class_id);
                                                } else {
                                                    console.error(
                                                        "Division document not found for division_id:",
                                                        admission.class_id
                                                    );
                                                }
                                                admission.class_id = class_id;
                                            }
                                            if (admission?.division_id) {
                                                divisionDoc =
                                                    await DivisionModel.findOne(
                                                        {
                                                            divisionId:
                                                                admission.division_id,
                                                        }
                                                    );

                                                if (divisionDoc) {
                                                    division_id =
                                                        divisionDoc.divisionId;
                                                    // console.log(division_id);
                                                } else {
                                                    console.error(
                                                        "Division document not found for division_id:",
                                                        admission.division_id
                                                    );
                                                }
                                                admission.division_id =
                                                    division_id;
                                            }
                                        }
                                    )
                                );
                                const installmentLengths =
                                    matchingAdmission.feesDetails.map((item) =>
                                        item.installment
                                            ? item.installment.length
                                            : 0
                                    );
                                const installments =
                                    installmentLengths.length > 0
                                        ? installmentLengths[0]
                                        : 0;

                                const installmentIds = feesData.map(
                                    (service) => service.installmentId
                                );

                                const installmentRecords =
                                    await FeesInstallmentModel.find({
                                        installmentId: { $in: installmentIds },
                                    });

                                const updatedInstallmentRecords =
                                    installmentRecords.map((record) => {
                                        let isDue = false;

                                        record.feesDetails.forEach((detail) => {
                                            detail.installment.forEach(
                                                (item) => {
                                                    const dateString =
                                                        item.date;

                                                    const date = new Date(
                                                        dateString
                                                    );

                                                    const year =
                                                        date.getFullYear();
                                                    const month = (
                                                        "0" +
                                                        (date.getMonth() + 1)
                                                    ).slice(-2);
                                                    const day = (
                                                        "0" +
                                                        (date.getDate() - 1)
                                                    ).slice(-2);

                                                    const formattedDate = `${year}/${month}/${day}`;

                                                    if (
                                                        item.status ==
                                                        "pending" &&
                                                        formattedDate <
                                                        criteria.currentDate
                                                    ) {
                                                        isDue = true;
                                                        return;
                                                    }
                                                }
                                            );

                                            if (isDue) return;
                                        });

                                        return {
                                            candidateName:
                                                matchingAdmission.name,
                                            className: classDoc?.name,
                                            phoneNumber:
                                                matchingAdmission.phoneNumber,
                                            divisionName: divisionDoc?.Name,
                                            courseName: course_id?.CourseName,
                                            courseFees: service?.courseFee,
                                            // dueStatus: isDue,
                                            // status: record.status,
                                            status: isDue
                                                ? "overdue"
                                                : (record.status = "pending"),
                                            paidAmount: service.paidAmount,
                                            remainingAmount:
                                                service.remainingAmount,
                                            feesPaymentId:
                                                service.feesPaymentId,
                                            installmentId:
                                                service.installmentId,
                                            addmissionId: service.addmissionId,
                                            empId: service.empId,
                                            installments: installmentLengths[0],
                                            groupId: service.groupId,
                                        };
                                        // console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",a);
                                    });

                                return updatedInstallmentRecords;
                            }

                            feesAdditionalData.addmissionId =
                                matchingAdmission || {};
                        }

                        additionalData.addmissionId = feesAdditionalData;

                        if (
                            Object.keys(feesAdditionalData.addmissionId)
                                .length === 0
                        )
                            return {
                                // ...service._doc,
                                ...additionalData.addmissionId.addmissionId,
                            };
                    })
                );

                const groupedServices = {};
                const visitedAddmissionIds = new Set();

                const fetchPaidAmount = async (addmissionId) => {
                    if (!visitedAddmissionIds.has(addmissionId)) {
                        visitedAddmissionIds.add(addmissionId);
                        a = await this.getPaymentData(groupId, addmissionId);
                    }
                    return a;
                };

                for (const serviceArray of servicesWithData) {
                    if (serviceArray.length > 0) {
                        const addmissionId = serviceArray[0].addmissionId;
                        const paidAmount = await fetchPaidAmount(addmissionId);

                        if (serviceArray.length == 1) {
                            const service = serviceArray[0];
                            service.paidAmount = parseFloat(service.paidAmount);
                            groupedServices[addmissionId] = service;
                        } else {
                            const lastService =
                                serviceArray[serviceArray.length - 1];
                            lastService.paidAmount = paidAmount;
                            groupedServices[addmissionId] = lastService;
                        }
                    }
                }

                const finalServices = Object.values(groupedServices);
                for (const service of finalServices) {
                    const installmentStatus =
                        await feesInstallmentServices.getByInstallmentStatus(
                            service.installmentId
                        );
                    service.status = installmentStatus.status.isDue;
                }

                totalCourseFee1 = finalServices.reduce((total, course) => {
                    return total + parseFloat(course.courseFees || 0);
                }, 0);

                let response = {
                    coursePayments: formattedCoursePayments,
                    servicesWithData: [finalServices],
                    totalFees: totalCourseFee1 || 0,
                    totalPaidFees: totalPaidAmount,
                    totalPendingFees: totalRemainingAmount,
                    totalItemsCount: finalServices.length,
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

    async getPaidAmount(addmissionId) {
        try {
            const paidamount = await feesPaymentModel.find({ addmissionId: addmissionId });
            return paidamount;
        } catch (err) {
            throw err;
        }
    }


}
module.exports = new feesPaymentService(feesPaymentModel, "FeesPayment");
