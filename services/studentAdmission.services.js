const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const studentAdmissionModel = require("../schema/studentAdmission.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const feesInstallmentServices = require("./feesInstallment.services");
const StudentsAdmissionModel = require("../schema/studentAdmission.schema");
const courseModel = require("../schema/courses.schema");
const ClassModel = require("../schema/classes.schema");
const DivisionModel = require("../schema/division.schema");
const FeesTemplateModel = require("../schema/feesTemplate.schema");
const feesTemplateModel = require("../schema/feesTemplate.schema");
const FeesPaymentModel = require("../schema/feesPayment.schema");

class StudentsAdmmisionService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async updateStudentsAddmisionById(studentAdmissionId, groupId, newData) {
        try {
            const updatedData = await studentAdmissionModel.findOneAndUpdate(
                { studentAdmissionId: studentAdmissionId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedData;
        } catch (error) {
            throw error;
        }
    }
    async updateUser(addmissionId, data) {
        try {
            const resp = await studentAdmissionModel.findOneAndUpdate(
                { addmissionId: addmissionId },

                data,
                { upsert: true, new: true }
            );

            return new ServiceResponse({
                data: resp,
            });
        } catch (error) {
            return new ServiceResponse({
                isError: true,
                message: error.message,
            });
        }
    }
    async deleteByStudentsAddmisionId(studentAdmissionId, groupId) {
        try {
            return await studentAdmissionModel.deleteOne(
                studentAdmissionId,
                groupId
            );
        } catch (error) {
            throw error;
        }
    }
    //     async addInstallment(groupId, addmissionId, memberObject) {
    //         const newMember = await feesInstallmentServices.create(memberObject);
    // console.log(newMember);
    //         const updatedGroup = await studentAdmissionModel
    //             .findOneAndUpdate(
    //                 // groupId,
    //                 addmissionId,
    //                 { $push: { feesDetails: newMember.data._id } },
    //                 { new: true }
    //             )
    //             .lean();

    //         const response = {
    //             status: "Success",
    //             data: updatedGroup,
    //             message: "installment updated successfully",
    //         };

    //         delete response.data; // Remove the memberObject from the response

    //         return response;
    //     }
   
    async getRecoveryData(groupId) {
        return this.execute(() => {
            return this.model.find({ groupId: groupId });
        });
    }
    async deleteCompanyDetails(addmissionId, installmentId) {
        try {
            const deletedMember =
                await feesInstallmentServices.deleteStudentById(installmentId);

            console.log("deletedMember", deletedMember.data.installmentId);

            if (deletedMember.isError) {
                return deletedMember;
            }

            const updatedAdmission =
                await StudentsAdmissionModel.findOneAndUpdate(
                    { addmissionId: addmissionId },
                    {
                        $pull: {
                            feesDetails: {
                                installmentId: deletedMember.data.installmentId,
                            },
                        },
                    },
                    { new: true }
                ).lean();

            return updatedAdmission;
        } catch (error) {
            console.error(error);
            // Handle the error accordingly
            return {
                isError: true,
                message: "An error occurred during the deletion process",
            };
        }
    }
    async getByAddmissionIdData(addmissionId) {
        return this.execute(() => {
            return this.model.findOne({ addmissionId: addmissionId });
        });
    }

    async getByAddmissionId(addmissionId) {
        try {
            const studentAdmission = await this.model.findOne({ addmissionId: addmissionId });
            console.log(studentAdmission);
            if (!studentAdmission) {
                throw new Error("Student admission not found");
            }
    
            let additionalData = {};
    
            // Process course details
            // if (studentAdmission.courseDetails && studentAdmission.courseDetails.length > 0) {
            //     additionalData.courseDetails = await Promise.all(
            //         studentAdmission.courseDetails.map(async (courseDetail) => {
            //             let courseAdditionalData = {};
    
            //             if (courseDetail.courseId) {
            //                 const course = await courseModel.findOne({ course_id: courseDetail.courseId });
            //                 courseAdditionalData.courseName = course ? course.CourseName : "";
            //                 courseAdditionalData.courseFee = course ? course.Fees : "";
            //             }
    
            //             if (courseDetail.classId) {
            //                 const classInfo = await ClassModel.findOne({ class_id: courseDetail.classId });
            //                 courseAdditionalData.className = classInfo ? classInfo.name : "";
            //             }
    
            //             if (courseDetail.divisionId) {
            //                 const divisionInfo = await DivisionModel.findOne({ division_id: courseDetail.divisionId });
            //                 courseAdditionalData.divisionName = divisionInfo ? divisionInfo.Name : "";
            //             }
    
            //             return courseAdditionalData;
            //         })
            //     );
            // }
    
            // Process fees details
            if (studentAdmission.feesDetails && studentAdmission.feesDetails.length > 0) {
                additionalData.feesDetails = await Promise.all(
                    studentAdmission.feesDetails.map(async (feesDetail) => {
                        let feesAdditionalData = {};
    
                        if (feesDetail.feesTemplateId) {
                            const feesTemplate = await feesTemplateModel.findOne({ feesTemplateId: feesDetail.feesTemplateId });
                            feesAdditionalData.feesTemplateId = feesTemplate;
                        }
    
                        return { ...feesDetail, ...feesAdditionalData };
                    })
                );
            }
    let response={
        status: 'success',
        data:{...studentAdmission._doc, ...additionalData}
    }
            return response
        } catch (error) {
            throw error;
        }
    }
    

    async getAllDataByGroupId(groupId, query, reverseOrder = true) {
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

            // if (query.userId) {
            //     searchFilter.userId = query.userId;
            // }
            // if (query.role) {
            //     searchFilter.role = query.role;
            // }
            // if (query.department) {
            //     searchFilter.department = query.department;
            // }

            // if (query.location) {
            //     searchFilter.location = query.location;
            // }
            // if (query.type) {
            //     searchFilter.type = query.type;
            // }
            const services = await studentAdmissionModel.find(searchFilter);
            const servicesWithData = await Promise.all(
                services.map(async (service) => {
                    if (
                        service.courseDetails &&
                        service.courseDetails.length > 0
                    ) {
                        const courseDetailsWithAdditionalData =
                            await Promise.all(
                                service.courseDetails.map(
                                    async (courseDetail) => {
                                        let additionalData = {};

                                        if (courseDetail.course_id) {
                                            const course_id =
                                                await courseModel.findOne({
                                                    course_id:
                                                        courseDetail.courseId,
                                                });
                                            additionalData.course_id =
                                                course_id;
                                        }

                                        if (courseDetail.class_id) {
                                            console.log(courseDetail.class_id);
                                            const class_id =
                                                await ClassModel.findOne({
                                                    classId:
                                                        courseDetail.class_id,
                                                });
                                            additionalData.class_id = class_id;
                                            console.log(class_id);
                                        }

                                        if (courseDetail.division_id) {
                                            const division_id =
                                                await DivisionModel.findOne({
                                                    divisionId:
                                                        courseDetail.division_id,
                                                });
                                            additionalData.division_id =
                                                division_id;
                                        }

                                        return {
                                            ...courseDetail,
                                            ...additionalData,
                                        };
                                    }
                                )
                            );

                        return {
                            ...service._doc,
                            courseDetails: courseDetailsWithAdditionalData,
                        };
                    }
                    return service;
                })
            );
            servicesWithData.sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return reverseOrder ? dateB - dateA : dateA - dateB;
            });
    
            const response = {
                status: "Success",
                data: {
                    items: servicesWithData,
                    totalItemsCount: services.length,
                },
            };
           
            // let results = await studentAdmissionModel.find(servicesWithData).sort({ createdAt: reverseOrder ? -1 : 1 });
            return response;
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
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
            if (query.addmissionId) {
                searchFilter.addmissionId = query.addmissionId;
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

            const services = await studentAdmissionModel.find(searchFilter);
            const servicesWithData = await Promise.all(
                services.map(async (service) => {
                    let additionalData = {};

                    // Process course details
                    if (
                        service.courseDetails &&
                        service.courseDetails.length > 0
                    ) {
                        const courseDetailsWithAdditionalData =
                            await Promise.all(
                                service.courseDetails.map(
                                    async (courseDetail) => {
                                        let courseAdditionalData = {};
                                        let course_id;
                                        let class_id;
                                        let division_id;
                                        if (courseDetail.course_id) {
                                            console.log("aaaqqqqqqqqqqqqqqqqqqqq", courseDetail.course_id);
                                            course_id =
                                                await courseModel.findOne({
                                                    courseId:
                                                        courseDetail.course_id,
                                                });

                                            courseAdditionalData.course_id =
                                                course_id;
                                            console.log("course_iddddddddddddddddddddddddd", course_id);
                                        }

                                        if (courseDetail.class_id) {
                                            class_id = await ClassModel.findOne(
                                                {
                                                    class_id:
                                                        courseDetail.classId,
                                                }
                                            );
                                            courseAdditionalData.class_id =
                                                class_id;
                                        }

                                        if (courseDetail.division_id) {
                                            division_id =
                                                await DivisionModel.findOne({
                                                    division_id:
                                                        courseDetail.divisionId,
                                                });
                                            console.log(
                                                "division_id",
                                                division_id.Name
                                            );
                                            courseAdditionalData.division_id =
                                                division_id;
                                        }

                                        return {
                                            courseName: course_id.CourseName,
                                            courseFee:course_id.Fees,
                                            className: class_id.name,
                                            divisionName: division_id.Name,
                                        };
                                    }
                                )
                            );

                        additionalData.courseDetails =
                            courseDetailsWithAdditionalData;
                    }

                    // Process fees details
                    if (service.feesDetails && service.feesDetails.length > 0) {
                        const feesDetailsWithAdditionalData = await Promise.all(
                            service.feesDetails.map(async (feesDetail) => {
                                let feesAdditionalData = {};

                                if (feesDetail.feesTemplateId) {
                                    const feesTemplateId =
                                        await feesTemplateModel.findOne({
                                            feesTemplateId:
                                                feesDetail.feesTemplateId,
                                        });
                                    feesAdditionalData.feesTemplateId =
                                        feesTemplateId;
                                }

                                return { ...feesDetail, ...feesAdditionalData };
                            })
                        );

                        additionalData.feesDetails =
                            feesDetailsWithAdditionalData;
                    }

                    return { ...service._doc, ...additionalData };
                })
            );
            // Fetch feesPayment data based on specific IDs
            const feesPaymentData = await FeesPaymentModel.find({
                groupId: groupId,
                empId: query.empId,
                addmissionId: query.addmissionId,
            });

            // let response1;
            let modifiedFeesPaymentData = [];

        
           
let response1 = []; // Define response1 as an array

for (const feesPayment of feesPaymentData) {
    try {
        const addmissionData = await studentAdmissionModel.findOne({
            addmissionId: feesPayment.addmissionId,
        });

        if (addmissionData) {
            const feesDetailsWithAdditionalData = [];
            for (const feesDetail of addmissionData.courseDetails) {
                let feesAdditionalData = {};

                if (feesDetail.course_id) {
                    const courseData = await courseModel.findOne({
                        course_id: feesDetail.courseId,
                    });
                    feesAdditionalData.course_id = courseData ? courseData.CourseName : '';
                }

                feesDetailsWithAdditionalData.push({
                    ...feesDetail,
                    ...feesAdditionalData,
                });
            }

            const convertedObject =
            feesDetailsWithAdditionalData.reduce(
                (acc, course) => {
                    acc = {courseName:course.course_id}
                    return acc;
                },
                {}
            );
            console.log(convertedObject);
            response1.push({
                ...feesPayment._doc,
                courseName: convertedObject.courseName,
            });
            modifiedFeesPaymentData.push(...feesDetailsWithAdditionalData);
        }
    } catch (error) {
        console.error("Error fetching data from studentAdmissionModel:", error);
        modifiedFeesPaymentData.push(feesPayment);
    }
}

console.log("feesDetailsWithAdditionalData:", modifiedFeesPaymentData);
console.log("Response1:", response1);

            

            console.log("Modified Fees Payment Data:", modifiedFeesPaymentData);
            const filteredData = servicesWithData.filter((data) => {
                return (
                    data.groupId === parseInt(groupId) &&
                        data.empId === query.empId &&
                        data.addmissionId == query.addmissionId,
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

    // async getAdmissionListing(groupId, academicYear, criteria) {
    //     const query = {
    //         groupId: groupId,
    //         academicYear: academicYear,
    //     };

    //     try {
    //         const admissionData = await this.preparePaginationAndReturnData(query, criteria);
    //         console.log(admissionData.data.items);

    //         const courseIds = [];

    //         admissionData.data.items.forEach((admission) => {
    //             if (admission.courseDetails && admission.courseDetails.length > 0) {
    //                 admission.courseDetails.forEach((courseDetail) => {
    //                     courseIds.push(courseDetail.course_id);
    //                 });
    //             }
    //         });

    //         console.log(courseIds);

    //         const courseDetails = await courseModel.find({ courseId: { $in: courseIds } });
    //         console.log("courseDetails", courseDetails);
    //         const courseCounts = {};

    //         courseIds.forEach((courseId) => {
    //             courseCounts[courseId] = (courseCounts[courseId] || 0) + 1;
    //         });

    //         console.log(courseCounts);
    //         admissionData.data.items.forEach((admission) => {
    //             if (admission.courseDetails && admission.courseDetails.length > 0) {
    //                 admission.courseDetails.forEach((courseDetail) => {
    //                     const matchingCourse = courseDetails.find((course) => course._id.equals(courseDetail.course_id));
    //                     if (matchingCourse) {
    //                         courseDetail.courseName = matchingCourse.name;
    //                         courseDetail.courseCount = courseCounts[courseDetail.course_id];
    //                     }
    //                 });
    //             }
    //         });
    // let response={
    //     data:admissionData,
    //     courseData:courseDetails,
    //     courseCounts:courseCounts

    // }
    //         return response;
    //     } catch (error) {
    //         console.error(error);
    //         // Handle the error accordingly
    //         return { isError: true, message: 'An error occurred during data retrieval' };
    //     }
    // }
    async  findLatestAdmission() {
        try {
          // Find the latest student admission based on the createdAt field in descending order
          const latestAdmission = await studentAdmissionModel.findOne().sort({ createdAt: -1 });
      console.log("latestAdmission",latestAdmission);
          return latestAdmission;
        } catch (error) {
          console.error(error);
          return { error: "Failed to find the latest admission." };
        }
      }
    async getAdmissionListing(groupId, academicYear, criteria) {
        const query = {
            groupId: groupId,
            academicYear: academicYear,
        };

        try {
            const admissionData = await this.preparePaginationAndReturnData(
                query,
                criteria
            );
            console.log(admissionData.data.items);

            const courseIds = [];

            admissionData.data.items.forEach((admission) => {
                if (
                    admission.courseDetails &&
                    admission.courseDetails.length > 0
                ) {
                    admission.courseDetails.forEach((courseDetail) => {
                        courseIds.push(courseDetail.course_id);
                    });
                }
            });

            console.log(courseIds);

            const courseCounts = [];

            const courseDetails = await courseModel.find({
                courseId: { $in: courseIds },
            });
            console.log("courseDetails", courseDetails);

            admissionData.data.items.forEach((admission) => {
                if (
                    admission.courseDetails &&
                    admission.courseDetails.length > 0
                ) {
                    admission.courseDetails.forEach((courseDetail) => {
                        const matchingCourse = courseDetails.find(
                            (course) =>
                                course.courseId.toString() ===
                                courseDetail.course_id.toString()
                        ); // Convert to string
                        if (matchingCourse) {
                            const courseId = matchingCourse.courseId.toString(); // Convert to string
                            const courseName =
                                matchingCourse.CourseName ||
                                matchingCourse.name; // Adjust property name based on your actual data
                            const existingCourse = courseCounts.find(
                                (courseCount) => courseCount.id === courseId
                            );
                            if (existingCourse) {
                                existingCourse.count += 1;
                            } else {
                                courseCounts.push({
                                    id: courseId,
                                    name: courseName,
                                    count: 1,
                                });
                            }
                        }
                    });
                }
            });

            console.log("courseCounts", courseCounts);

            let response = {
                // data: admissionData,
                // courseData: courseDetails,
                data: courseCounts,
            };

            console.log("response", response);

            return response;
        } catch (error) {
            console.error(error);
            // Handle the error accordingly
            return {
                isError: true,
                message: "An error occurred during data retrieval",
            };
        }
    }
}
module.exports = new StudentsAdmmisionService(
    studentAdmissionModel,
    "studentAdmission"
);
