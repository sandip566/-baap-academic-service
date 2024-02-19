const feesPaymentModel = require("../schema/feesPayment.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const StudentsAdmissionModel = require("../schema/studentAdmission.schema");
const courseModel = require("../schema/courses.schema");
const ClassModel = require("../schema/classes.schema");
const DivisionModel = require("../schema/division.schema");
const feesTemplateModel = require("../schema/feesTemplate.schema");
const FeesInstallmentModel=require("../schema/feesInstallment.schema")

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
            const count = await this.model.countDocuments(data);
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

            let response = {
                totalPaidAmount: totalPaidAmount,
                totalRemainingAmount: totalRemainingAmount,
                // feesDefaulter: data,
                count:count,
                servicesWithData: servicesWithData,
                totalItemsCount: await this.model.countDocuments(data),
            };
            return response;
        });
    }

    async getFeesStatData(groupId, criteria,page,limit) {
        return this.execute(async () => {
            try {
            const query = {
                groupId: groupId,
            };
  
            let courseData = await courseModel.find({ groupId: groupId });
            let admissionData = await StudentsAdmissionModel.find({
                groupId: groupId,
            });
            let feesData = await this.model.find({ groupId: groupId });

                console.log(criteria.currentDate, criteria.currentDate);
                const currentDateValue = criteria.currentDate
                    ? criteria.currentDate
                    : null;
                console.log(currentDateValue);
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
                if (criteria.month) {
                    query.month = criteria.month;
                    const month = query.month.padStart(2, "0"); // Ensure month is zero-padded
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
                            console.log("matchingCourses", matchingCourses);
                            return matchingCourses;
                        }
                        return false;
                    });
                }

                console.log("qqqqqqqqqqqqqqq", admissionData);

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
                    coursePayments[course.CourseName] = {
                        totalPaidAmount: 0,
                        totalRemainingAmount: 0,
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
                            totalPaidAmount:
                                coursePayments[courseName].totalPaidAmount,
                            totalRemainingAmount:
                                coursePayments[courseName].totalRemainingAmount,
                        };
                    }
                );
                let course_id;
                let class_id;
                let division_id;
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
                                    admission.addmissionId === service.addmissionId
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
                                                class_id =
                                                    await ClassModel.findOne({
                                                        feesTemplateId:
                                                            admission.class_id,
                                                    });
                                                admission.class_id = class_id;
                                            }
                                            if (admission.division_id) {
                                                division_id =
                                                    await DivisionModel.findOne(
                                                        {
                                                            divisionId:
                                                                admission.division_id,
                                                        }
                                                    );
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
                                console.log(
                                    "Lengths of installment arrays:",
                                    installmentLengths
                                );


                                const installmentIds = feesData.map(service => service.installmentId);

const installmentRecords = await FeesInstallmentModel.find({ installmentId: { $in: installmentIds } });

const updatedInstallmentRecords = installmentRecords.map(record => {
    let isDue = false; 

    record.feesDetails.forEach(detail => {
        detail.installment.forEach(item => {
            if (item.status === 'pending' &&(item.date) < criteria.currentDate) {
              
                isDue = true;
                return; 
            }
        });
        if (isDue) return; 
    });

    return {
        candidateName: matchingAdmission.name,
        className: class_id?.name,
        phoneNumber: matchingAdmission.phoneNumber,
        divisionName: division_id?.Name,
        courseName: course_id?.CourseName,
        courseFees: course_id?.Fees,
        dueStatus: isDue, 
        status:record.status,
        paidAmount: service.paidAmount,
        remainingAmount: service.remainingAmount,
        feesPaymentId: service.feesPaymentId,
        installmentId: service.installmentId,
        addmissionId: service.addmissionId,
        empId: service.empId,
        groupId: service.groupId,
    };
});

console.log("Updated installmentRecords: ", updatedInstallmentRecords);

return updatedInstallmentRecords;

                            }
                
                            feesAdditionalData.addmissionId = matchingAdmission || {};
                        }
                
                        additionalData.addmissionId = feesAdditionalData;
                
                        if (Object.keys(feesAdditionalData.addmissionId).length === 0) {
                            return {};
                        }
                
                        return {
                            ...service._doc,
                            ...additionalData.addmissionId,
                        };
                    })
                );
                
                // Filter out duplicates based on addmissionId and keep only the last occurrence
                const filteredServices = servicesWithData.reduce((acc, current) => {
                    acc[current.addmissionId] = current;
                    return acc;
                }, {});
                
              
                const finalServices = Object.values(filteredServices);
            //    console.log("finalServices", finalServices);   
                const filteredServicesWithData = servicesWithData.filter(
                    (service) => Object.keys(service).length !== 0
                );
               
                let response = {
                    coursePayments: formattedCoursePayments,
                    servicesWithData: finalServices,
                    totalItemsCount: await this.model.countDocuments(filteredServicesWithData,formattedCoursePayments)
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

    async getByfeesPaymentId(groupId, feesPaymentId) {
        return this.execute(async () => {
            let feesdata = {};
            let course_id;
            let class_id;
            let feesTemplateId;
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

                    courseAdditionalData.course_id = courseDetails;
                    courseAdditionalData.class_id = classDetails;
                    courseAdditionalData.feesTemplateId = feesTemplateIds;

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
            feesPayment.paidAmount = totalPaidAmount;
            feesPayment.remainingAmount = remainingAmount;
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
