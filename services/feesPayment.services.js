const feesPaymentModel = require("../schema/feesPayment.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const StudentsAdmissionModel = require("../schema/studentAdmission.schema");
const courseModel = require("../schema/courses.schema");

class feesPaymentService extends BaseService {
  constructor(dbModel, entityName) {
    super(dbModel, entityName);
  }
  async getRecoveryData(groupId) {
    return this.execute(async () => {
        let data = await this.model.find({ groupId: groupId });
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

                if (service.addmissionId ) {
                    const feesTemplateId = await StudentsAdmissionModel.findOne({ addmissionId: service.addmissionId });
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
            servicesWithData: servicesWithData
           
        };
        return response;
    });
}

async getFeesStatData(groupId, currentDate, academicYear) {
  console.log(currentDate, academicYear);
  return this.execute(async () => {
    let data = await this.model.find({ groupId: groupId });
    let courseData = await courseModel.find({ groupId: groupId });
    let admissionData = await StudentsAdmissionModel.find({ groupId: groupId });
    let feesData = await this.model.find({ groupId: groupId });

    // Convert currentDateValue to a Date object
    const currentDateValue = currentDate ? currentDate.currentDate : null;
    const currentDateObj = currentDateValue ? new Date(currentDateValue) : null;

    // Filter feesData based on the currentDate if provided
    if (currentDateObj) {
      const year = currentDateObj.getFullYear();
      const month = String(currentDateObj.getMonth() + 1).padStart(2, '0');
      const day = String(currentDateObj.getDate()).padStart(2, '0');
      const formattedDate = `${year}/${month}/${day}`;
      console.log("Formatted Date:", formattedDate);
      feesData = feesData.filter(fee => fee.currentDate === formattedDate);
    }

    // Filter feesData based on the academicYear if provided
    if (academicYear) {
      feesData = feesData.filter(fee => {
        console.log("Fee Academic Year:", fee.academicYear);
        console.log("Query Academic Year:", academicYear);
        return fee.academicYear == academicYear;
      });
    }

    console.log("Filtered Fees Data by Date:", feesData);

    // Initialize coursePayments object to store payment information
    let coursePayments = {};
    courseData.forEach(course => {
      coursePayments[course.CourseName] = {
        totalPaidAmount: 0,
        totalRemainingAmount: 0
      };
    });

    // Iterate over admissionData to calculate payments
    admissionData.forEach(admission => {
      if (admission.courseDetails && admission.courseDetails.length > 0) {
        admission.courseDetails.forEach(courseDetail => {
          const courseId = courseDetail.course_id;
          const courseExists = courseData.find(course => course.courseId === courseId);

          if (courseExists) {
            const courseName = courseExists.CourseName;
            const paymentsForCourse = feesData.filter(payment => payment.addmissionId === admission.addmissionId);
            const paidAmountForCourse = paymentsForCourse.reduce((total, payment) => total + parseFloat(payment.paidAmount || 0), 0);
            const remainingAmountForCourse = paymentsForCourse.reduce((total, payment) => total + parseFloat(payment.remainingAmount || 0), 0);

            coursePayments[courseName].totalPaidAmount += paidAmountForCourse;
            coursePayments[courseName].totalRemainingAmount += remainingAmountForCourse;
          }
        });
      }
    });

    console.log("Course-wise Payment Information:");
    console.log(coursePayments);

    const servicesWithData = await Promise.all(
      data.map(async (service) => {
        let additionalData = {};
        let feesAdditionalData = {};

        if (service.addmissionId) {
          const feesTemplateId = await StudentsAdmissionModel.findOne({ addmissionId: service.addmissionId });
          feesAdditionalData.addmissionId = feesTemplateId;
        }

        additionalData.addmissionId = feesAdditionalData;

        return { ...service._doc, ...additionalData.addmissionId };
      })
    );

    let response = {
      coursePayments: coursePayments,
      servicesWithData: servicesWithData
    };

    return response;
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




async  updatePaidAmountInDatabase(feesPaymentId, totalPaidAmount,remainingAmount) {
  try {
 
    const feesPayment = await feesPaymentModel.findOne({ feesPaymentId:feesPaymentId });
    if (!feesPayment) {
      return { success: false, error: "Fees payment record not found." };
    }
    feesPayment.paidAmount = totalPaidAmount;
    feesPayment.remainingAmount=remainingAmount
    await feesPayment.save();

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update paid amount in the database." };
  }
}

  getAllFeesPaymentByGroupId(groupId, criteria) {
    const query = {
      groupId: groupId,
    };
    if (criteria.feesPaymentId) query.feesPaymentId = criteria.feesPaymentId;
    if (criteria.empId) query.empId = criteria.empId;
    if (criteria.userId) query.userId = criteria.userId;
    if (criteria.installmentId) query.installmentId = criteria.installmentId;
    return this.preparePaginationAndReturnData(query, criteria)
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