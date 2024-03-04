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
class feesPaymentService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getRecoveryData(groupId, skip, limit) {
        return this.execute(async () => {
            let data = await this.model
                .find({ groupId: groupId })
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
                const addmissionId = service?.addmissionId?.addmissionId;
                const paidAmount = parseFloat(service.paidAmount) || 0;

                // Update or initialize the entry for the current addmissionId with the latest service data
                lastServices[addmissionId] = {
                    ...service,
                    paidAmount:
                        (lastServices[addmissionId]?.paidAmount || 0) +
                        paidAmount,
                };
            });

            const finalServices = Object.values(lastServices);

            let response = {
                totalPaidAmount: totalPaidAmount,
                totalRemainingAmount: totalRemainingAmount,
                // feesDefaulter: data,
                //count:count,
                servicesWithData: finalServices,
                StudentRecords: await this.model.countDocuments(data),
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
                let courseFee=0;
                let admissionData = await StudentsAdmissionModel.find({
                    groupId: groupId,
                });

                let feesData = await this.model
                    .find({ groupId: groupId })
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
                            const courseId = courseDetail.course_id;

                            const courseExists = courseData.find(
                                (course) => course.courseId === courseId
                            );

                            if (courseExists) {
                                const courseName = courseExists.CourseName;
                                //    console.log("uuuuuuuuuuuuuuuuuuu",courseName);

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
                                        (total, payment) =>
                                            total +
                                            parseFloat(
                                                payment.remainingAmount || 0
                                            ),
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
                        return {
                            name: courseName,
                            courseId: coursePayments[courseName].courseId,
                            courseFee: coursePayments[courseName].courseFee*coursePayments[courseName].noOfStudents||0 ,
                            noOfStudents:
                                coursePayments[courseName].noOfStudents || 0,
                            totalPaidAmount:
                                coursePayments[courseName].totalPaidAmount,
                            totalRemainingAmount:
                                coursePayments[courseName].totalRemainingAmount,
                        };
                    }
                );
                console.log("hhhhhhhhhhhhhhhhhhhhh",formattedCoursePayments);
                let totalPaidAmount = 0;
                let totalRemainingAmount = 0;
let totalCourseFee=0
                formattedCoursePayments.forEach((course) => {
                    totalPaidAmount += course.totalPaidAmount || 0;
                    totalRemainingAmount += course.totalRemainingAmount || 0;
                });
                 totalCourseFee = formattedCoursePayments.reduce((total, course) => total + course.courseFee, 0);
                console.log("Total course fee:", totalCourseFee||0);   
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
                // const servicesWithData = await Promise.all(
                //     feesData?.map(async (service) => {
                //         let additionalData = {};
                //         let feesAdditionalData = {};

                //         if (service.addmissionId) {
                //             const matchingAdmission = admissionData.find(
                //                 (admission) =>
                //                     admission.addmissionId ===
                //                     service.addmissionId
                //             );

                //             if (matchingAdmission) {
                //                 await Promise.all(
                //                     matchingAdmission.courseDetails.map(
                //                         async (admission) => {
                //                             if (admission.course_id) {
                //                                 course_id =
                //                                     await courseModel.findOne({
                //                                         courseId:
                //                                             admission.course_id,
                //                                     });
                //                                 admission.course_id = course_id;
                //                             }
                //                             if (admission.class_id) {
                //                                 class_id =
                //                                     await ClassModel.findOne({
                //                                         feesTemplateId:
                //                                             admission.class_id,
                //                                     });
                //                                 admission.class_id = class_id;
                //                             }
                //                             if (admission.division_id) {
                //                                 division_id =
                //                                     await DivisionModel.findOne(
                //                                         {
                //                                             divisionId:
                //                                                 admission.division_id,
                //                                         }
                //                                     );
                //                                 admission.division_id =
                //                                     division_id;
                //                             }
                //                         }
                //                     )
                //                 );
                //                 const installmentLengths =
                //                     matchingAdmission.feesDetails.map((item) =>
                //                         item.installment
                //                             ? item.installment.length
                //                             : 0
                //                     );
                //                 const installments =
                //                     installmentLengths.length > 0
                //                         ? installmentLengths[0]
                //                         : 0;
                //                 console.log(
                //                     "Lengths of installment arrays:",
                //                     installmentLengths
                //                 );
                //                 console.log(matchingAdmission.feesDetails);

                //                return{
                //                     candidateName: matchingAdmission.name,
                //                     className: class_id?.name,
                //                     phoneNumber: matchingAdmission.phoneNumber,
                //                     divisionName: division_id?.Name,
                //                     courseName: course_id?.CourseName,
                //                     courseFees: course_id?.Fees,
                //                     installments: installments,
                //                     paidAmount: service.paidAmount,
                //                     remainingAmount: service.remainingAmount,
                //                     feesPaymentId: service.feesPaymentId,
                //                     addmissionId: service.addmissionId,
                //                     empId: service.empId,
                //                     groupId: service.groupId,
                //                     // courseFee:course_id.Fees,
                //                 };

                //             }

                //             feesAdditionalData.addmissionId =
                //                 matchingAdmission || {};
                //         }

                //         additionalData.addmissionId = feesAdditionalData;

                //         if (
                //             Object.keys(feesAdditionalData.addmissionId)
                //                 .length === 0
                //         ) {
                //             return {};
                //         }

                //         return {
                //             ...service._doc,
                //             ...additionalData.addmissionId,
                //         };
                //     })
                // )

                const servicesWithData = await Promise.all(
                    feesData?.map(async (service) => {
                        let additionalData = {};
                        let feesAdditionalData = {};

                        if (service.addmissionId) {
                            const matchingAdmission = admissionData.find(
                                (admission) =>
                                    admission.addmissionId ===
                                    service.addmissionId
                            );

                            if (matchingAdmission) {
                                await Promise.all(
                                    matchingAdmission.courseDetails.map(
                                        async (admission) => {
                                            if (admission.course_id) {
                                                course_id =
                                                    await courseModel.findOne({
                                                        courseId:
                                                            admission.course_id,
                                                    });
                                                admission.course_id = course_id;
                                            }

                                            if (admission.class_id) {
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
                                            if (admission.division_id) {
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
                                // console.log(
                                //     "Lengths of installment arrays:",
                                //     installmentLengths
                                // );

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
                                                    const day =
                                                        "0" +
                                                        date.getDate() -
                                                        1;

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
                                            courseFees: course_id?.Fees,
                                            dueStatus: isDue,
                                            status: record.status,
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

                // Grouping services based on addmissionId and keeping only the last occurrence
                // const groupedServices = {};

                // servicesWithData.forEach((serviceArray) => {

                //     if (serviceArray.length > 0) {
                //         const addmissionId =  serviceArray[0].addmissionId;
                //         console.log("pppppppppppppppppppppppppppppp",addmissionId);
                //         let totalPaidAmount = 0;
                //         for (const service of serviceArray) {
                //             totalPaidAmount += parseFloat(
                //                 service.paidAmount || 0
                //             );
                //         }

                //         if (serviceArray.length == 1) {
                //             const service = serviceArray[0];
                //             service.paidAmount = parseFloat(service.paidAmount);
                //             groupedServices[addmissionId] = service;
                //         } else {
                //             const lastService =
                //                 serviceArray[serviceArray.length - 1];
                //             lastService.paidAmount = totalPaidAmount;
                //             groupedServices[addmissionId] = lastService;
                //         }
                //     }
                // });
                // // console.log(groupedServices);
                const groupedServices = {};
                const visitedAddmissionIds = new Set();
                
                // Function to fetch paidAmount for each addmissionId
                const fetchPaidAmount = async (addmissionId) => {
                    if (!visitedAddmissionIds.has(addmissionId)) {
                        visitedAddmissionIds.add(addmissionId);
                         a= await this.getPaymentData(groupId, addmissionId);
                    }
                    return a;
                };
                
                // Iterate over servicesWithData
                for (const serviceArray of servicesWithData) {
                    if (serviceArray.length > 0) {
                        const addmissionId = serviceArray[0].addmissionId;
                
                        // Fetch paidAmount only once per addmissionId
                        const paidAmount = await fetchPaidAmount(addmissionId);
                        console.log("pppppppppppppppppppppppppppppp", addmissionId);
                        console.log("mmmmmmmmmmmmmmmmmmm", paidAmount);
                
                        if (serviceArray.length == 1) {
                            const service = serviceArray[0];
                            service.paidAmount = parseFloat(service.paidAmount);
                            groupedServices[addmissionId] = service;
                        } else {
                            const lastService = serviceArray[serviceArray.length - 1];
                            lastService.paidAmount = paidAmount;
                            groupedServices[addmissionId] = lastService;
                        }
                    }
                }
                
                const finalServices = Object.values(groupedServices);
                console.log("llllllllllllllllllllllll",finalServices.length);
                // const groupedServices = {};
                // let paidAmount;
                // servicesWithData.forEach(async (serviceArray) => {
                //     if (serviceArray.length > 0) {
                //         const addmissionId = serviceArray[0].addmissionId;
                //         console.log(
                //             "pppppppppppppppppppppppppppppp",
                //             addmissionId
                //         );

                //         if (!visitedAddmissionIds.has(addmissionId)) {
                //             visitedAddmissionIds.add(addmissionId);

                //             paidAmount = await this.getPaymentData(
                //                 groupId,
                //                 addmissionId
                //             );
                //             console.log("mmmmmmmmmmmmmmmmmmm", paidAmount);
                //         }
                //         if (serviceArray.length == 1) {
                //             const service = serviceArray[0];
                //             service.paidAmount = parseFloat(service.paidAmount);
                //             groupedServices[addmissionId] = service;
                //         } else {
                //             const lastService =
                //                 serviceArray[serviceArray.length - 1];
                //             lastService.paidAmount = paidAmount;
                //             groupedServices[addmissionId] = lastService;
                //         }
                //         // groupedServices[serviceArray]=paidAmount
                //     }
                // });

                // const finalServices = Object.values(groupedServices);
                // const finalServices = Object.values(groupedServices);

                // console.log(finalServices);
                
                let response = {
                    coursePayments: formattedCoursePayments,
                    servicesWithData: [finalServices],
                    totalFees: totalCourseFee||0,
                    totalPaidFees: totalPaidAmount,
                    totalPendingFees: totalRemainingAmount,
                    totalItemsCount:finalServices.length
                    // totalItemsCount: await this.model.countDocuments(
                    //     // filteredServicesWithData,
                    //     finalServices
                    // ),
                };

                return response;
            } catch (error) {
                console.error("Error occurred:", error);
                throw error;
            }
        });
    }

    async getByAdmissionAndEmpId(addmissionId, empId) {
        return this.execute(() => {
            return this.model
                .findOne({
                    addmissionId: addmissionId,
                    empId: empId,
                })
                .sort({ _id: -1 });
        });
    }

    async getPaymentData(groupId, addmissionId) {
        console.log(groupId, addmissionId);
        try {
            // Convert single addmissionId into an array if it's not already an array
            const addmissionIdArray = Array.isArray(addmissionId)
                ? addmissionId
                : [addmissionId];

            const pipeline = [
                {
                    $match: {
                        groupId: Number(groupId),
                        addmissionId: { $in: addmissionIdArray.map(Number) },
                    },
                },
                {
                    $group: {
                        _id: "$addmissionId",
                        lastRecord: { $last: "$$ROOT" }, // Get the last record for each addmissionId
                        paidAmount: { $sum: { $toDouble: "$paidAmount" } }, // Calculate total paidAmount
                    },
                },
            ];

            const paymentData = await this.model.aggregate(pipeline);

            // console.log("Payment Data:", paymentData[0]._id);

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
                            console.log(course_id);
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

    //original
    // async getFeesStatData(groupId) {
    //   return this.execute(async () => {
    //     let data = await this.model.find({ groupId: groupId });
    //     let courseData = await courseModel.find({ groupId: groupId });
    // let admissionData = await StudentsAdmissionModel.find({ groupId: groupId });
    // let feesData = await this.model.find({ groupId: groupId });

    // let coursePayments = {};

    // courseData.forEach(course => {
    //   // console.log(course.CourseName);
    //     coursePayments[course.CourseName] = {

    //         totalPaidAmount: 0,
    //         totalRemainingAmount: 0

    //     };
    // });

    // if (admissionData && admissionData.length > 0) {
    //     admissionData.forEach(admission => {
    //         if (admission.courseDetails && admission.courseDetails.length > 0) {
    //             admission.courseDetails.forEach(courseDetail => {
    //                 const courseId = courseDetail.course_id;
    //                 console.log("courseId: " + courseId);
    //                 const courseExists = courseData.find(course => course.courseId == courseId);

    //                 if (courseExists) {
    //                     const courseName = courseExists.CourseName;
    //               console.log(courseName);
    //                     const paymentsForCourse = feesData?.filter(payment => payment.addmissionId === admission.addmissionId);
    //                     const paidAmountForCourse = paymentsForCourse.reduce((total, payment) => total + parseFloat(payment.paidAmount), 0);
    //                     const remainingAmountForCourse = paymentsForCourse.reduce((total, payment) => total + parseFloat(payment.remainingAmount||0), 0);

    //                     coursePayments[courseName].totalPaidAmount += paidAmountForCourse;
    //                     coursePayments[courseName].totalRemainingAmount += remainingAmountForCourse;
    //                 }
    //             });
    //         }
    //     });
    // } else {
    //     console.log("No admission data found for groupId:", groupId);
    // }

    // console.log("Course-wise Payment Information:");
    // console.log(coursePayments);

    //       const servicesWithData = await Promise.all(
    //           data.map(async (service) => {
    //               let additionalData = {};
    //               let feesAdditionalData = {};

    //               if (service.addmissionId ) {
    //                   const feesTemplateId = await StudentsAdmissionModel.findOne({ addmissionId: service.addmissionId });
    //                   feesAdditionalData.addmissionId = feesTemplateId;
    //                   // console.log(feesTemplateId);
    //               }

    //               additionalData.addmissionId = feesAdditionalData;

    //               return { ...service._doc, ...additionalData.addmissionId };
    //           })
    //       );
    //     //   const totalPaidAmount = data.reduce((total, item) => {
    //     //     if (item.paidAmount) {
    //     //         total += parseFloat(item.paidAmount);
    //     //     }
    //     //     return total;
    //     // }, 0);

    //     // const totalRemainingAmount = data.reduce((total, item) => {
    //     //     if (item.remainingAmount) {
    //     //         total += parseFloat(item.remainingAmount);
    //     //     }
    //     //     return total;
    //     // }, 0);

    //       let response = {

    //         coursePayments: coursePayments,
    //           servicesWithData:servicesWithData
    //           // totalPaidAmount: totalPaidAmount,
    //           // totalRemainingAmount: totalRemainingAmount,
    //           // feesDefaulter: data,

    //       };
    //       return response;
    //   });
    // }

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
}
module.exports = new feesPaymentService(feesPaymentModel, "FeesPayment");
