const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const studentAdmissionModel = require("../schema/studentAdmission.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const feesInstallmentServices = require("./feesInstallment.services");
const StudentsAdmissionModel = require("../schema/studentAdmission.schema");
const courseModel=require("../schema/courses.schema")

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
    async getByaddmissionId(addmissionId) {
        return this.execute(() => {
            return this.model.findOne({ addmissionId: addmissionId });
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

    async getAllDataByGroupId(groupId, query) {
        try {
            const searchFilter = {
                groupId: groupId,
            };

            if (query.search) {
                const numericSearch = parseInt(query.search);
                if (!isNaN(numericSearch)) {
                    searchFilter.$or = [
                        { first_name: { $regex: query.search, $options: 'i' } },
                        { last_name: { $regex: query.search, $options: 'i' } },
                        { phone_number: numericSearch },
                    ];
                } else {
                    searchFilter.$or = [
                        { name: { $regex: query.search, $options: 'i' } },
                        { email: { $regex: query.search, $options: 'i' } },
                    ];
                }
            }

            if (query.phone_number) {
                searchFilter.phone_number = query.phone_number;
            }

            if (query.first_name) {
                searchFilter.first_name = { $regex: query.first_name, $options: 'i' };
            }

            if (query.last_name) {
                searchFilter.last_name = { $regex: query.last_name, $options: 'i' };
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

            const response = {
                status: "Success",
                data: {
                    items: services,
                    totalItemsCount: services.length
                }
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
   
    async getAdmissionListing(groupId, academicYear, criteria) {
        const query = {
            groupId: groupId,
            academicYear: academicYear,
        };
    
        try {
            const admissionData = await this.preparePaginationAndReturnData(query, criteria);
            console.log(admissionData.data.items);
    
            const courseIds = [];
    
            admissionData.data.items.forEach((admission) => {
                if (admission.courseDetails && admission.courseDetails.length > 0) {
                    admission.courseDetails.forEach((courseDetail) => {
                        courseIds.push(courseDetail.course_id);
                    });
                }
            });
    
            console.log(courseIds);
    
            const courseCounts = [];
    
            const courseDetails = await courseModel.find({ courseId: { $in: courseIds } });
            console.log("courseDetails", courseDetails);
    
            admissionData.data.items.forEach((admission) => {
                if (admission.courseDetails && admission.courseDetails.length > 0) {
                    admission.courseDetails.forEach((courseDetail) => {
                        const matchingCourse = courseDetails.find((course) => course.courseId.toString() === courseDetail.course_id.toString());  // Convert to string
                        if (matchingCourse) {
                            const courseId = matchingCourse.courseId.toString();  // Convert to string
                            const courseName = matchingCourse.CourseName || matchingCourse.name;  // Adjust property name based on your actual data
                            const existingCourse = courseCounts.find((courseCount) => courseCount.id === courseId);
                            if (existingCourse) {
                                existingCourse.count += 1;
                            } else {
                                courseCounts.push({ id: courseId, name: courseName, count: 1 });
                            }
                        }
                    });
                }
            });
    
            console.log("courseCounts", courseCounts);
    
            let response = {
                // data: admissionData,
                // courseData: courseDetails,
                data: courseCounts
            };
    
            console.log("response", response);
    
            return response;
        } catch (error) {
            console.error(error);
            // Handle the error accordingly
            return { isError: true, message: 'An error occurred during data retrieval' };
        }
    }
    
    
    
}
module.exports = new StudentsAdmmisionService(
    studentAdmissionModel,
    "studentAdmission"
);
