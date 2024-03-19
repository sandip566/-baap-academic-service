const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const studentAdmissionModel = require("../schema/studentAdmission.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const feesInstallmentServices = require("./feesInstallment.services");
const StudentsAdmissionModel = require("../schema/studentAdmission.schema");
const courseModel = require("../schema/courses.schema");
const ClassModel = require("../schema/classes.schema");
const DivisionModel = require("../schema/division.schema");
const religionModel = require("../schema/religion.schema");
const feesPaymentModel = require("../schema/feesPayment.schema")
const SubjectModel = require("../schema/subjects.schema");
const categoryModel=require("../schema/categories.schema")
// const FeesTemplateModel = require("../schema/feesTemplate.schema");
const feesTemplateModel = require("../schema/feesTemplate.schema");

const FeesPaymentModel = require("../schema/feesPayment.schema");
const CategoriesModel = require("../schema/categories.schema");
const AcademicYearModel = require("../schema/academicyear.schema");

class StudentsAdmmisionService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getByInstallmentId(installmentId) {
        return this.execute(() => {
            return this.model.findOne({ installmentId: installmentId });
        });
    }
    async updateFeesInstallmentById(installmentId, newFeesDetails, newData) {
        try {
            const updateResult = await studentAdmissionModel.findOneAndUpdate(
                { installmentId: installmentId },
                { feesDetails: newFeesDetails, ...newData },
                { new: true }
            );
            return updateResult;
        } catch (error) {
            throw error;
        }
    }

    async updateStudentsAddmisionById(addmissionId, groupId, newData) {
        try {
            const updatedData = await studentAdmissionModel.findOneAndUpdate(
                { addmissionId: addmissionId, groupId: groupId },
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
            const studentAdmission = await this.model.findOne({
                addmissionId: addmissionId,
            });
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

            if(query.academicYear){
                searchFilter.academicYear=query.academicYear
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

                                        if (
                                            courseDetail?.course_id &&
                                            courseDetail?.course_id !== "null"
                                        ) {
                                            console.log(
                                                "ddddddddddddddddd",
                                                courseDetail?.course_id
                                            );
                                            const course_id =
                                                await courseModel.findOne({
                                                    courseId:
                                                        courseDetail?.course_id,
                                                });
                                            console.log(course_id);
                                            additionalData.course_id =
                                                course_id;
                                        }

                                        // if (courseDetail.class_id) {
                                        //     console.log(courseDetail.class_id);
                                        //     const class_id =
                                        //         await ClassModel.findOne({
                                        //             classId:
                                        //                 courseDetail.class_id,
                                        //         });
                                        //     additionalData.class_id = class_id;
                                        //     console.log(class_id);
                                        // }
                                        if (courseDetail?.class_id) {
                                            const classId = parseInt(
                                                courseDetail?.class_id
                                            );
                                            if (!isNaN(classId)) {
                                                const class_id =
                                                    await ClassModel.findOne(
                                                        {
                                                            classId: classId,
                                                        }
                                                    );
                                                additionalData.class_id =
                                                    class_id;
                                            } else {
                                                console.error(
                                                    "courseDetail.class_id is not a valid number:",
                                                    courseDetail?.class_id
                                                );
                                            }
                                        }

                                        // if (courseDetail.division_id) {
                                        //     const division_id =
                                        //         await DivisionModel.findOne({
                                        //             divisionId:
                                        //                 courseDetail.division_id,
                                        //         });
                                        //     additionalData.division_id =
                                        //         division_id;
                                        // }
                                        if (courseDetail?.division_id) {
                                            const divisionId = parseInt(
                                                courseDetail?.division_id
                                            );
                                            if (!isNaN(divisionId)) {
                                                const division_id =
                                                    await DivisionModel.findOne(
                                                        {
                                                            divisionId:
                                                                divisionId,
                                                        }
                                                    );
                                                additionalData.division_id =
                                                    division_id;
                                            } else {
                                                console.error(
                                                    "courseDetail.division_id is not a valid number:",
                                                    courseDetail?.division_id
                                                );
                                            }
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
//     async getfeesPayment(groupId, query) {
//         try {
//             const searchFilter = {
//                 groupId: groupId,
//             };

//             if (query.search) {
//                 const numericSearch = parseInt(query.search);
//                 if (!isNaN(numericSearch)) {
//                     searchFilter.$or = [
//                         { firstName: { $regex: query.search, $options: "i" } },
//                         { lastName: { $regex: query.search, $options: "i" } },
//                         { phoneNumber: numericSearch },
//                     ];
//                 } else {
//                     searchFilter.$or = [
//                         { firstName: { $regex: query.search, $options: "i" } },
//                         { lastName: { $regex: query.search, $options: "i" } },
//                     ];
//                 }
//             }

//             if (query.phoneNumber) {
//                 searchFilter.phoneNumber = query.phoneNumber;
//             }
//             if (query.addmissionId) {
//                 searchFilter.addmissionId = query.addmissionId;
//             }

//             if (query.firstName) {
//                 searchFilter.firstName = {
//                     $regex: query.firstName,
//                     $options: "i",
//                 };
//             }

//             if (query.lastName) {
//                 searchFilter.lastName = {
//                     $regex: query.lastName,
//                     $options: "i",
//                 };
//             }

//             const services = await studentAdmissionModel.find(searchFilter);
//             const servicesWithData = await Promise.all(
//                 services.map(async (service) => {
//                     let additionalData = {};

//                     // Process course details
//                     if (
//                         service.courseDetails &&
//                         service.courseDetails.length > 0
//                     ) {
//                         const courseDetailsWithAdditionalData =
//                             await Promise.all(
//                                 service.courseDetails.map(
//                                     async (courseDetail) => {
//                                         let courseAdditionalData = {};
//                                         let course_id;
//                                         let class_id;
//                                         let division_id;
//                                         if (courseDetail.course_id) {

//                                             course_id =
//                                                 await courseModel.findOne({
//                                                     courseId:
//                                                         courseDetail.course_id,
//                                                 });

//                                             courseAdditionalData.course_id =
//                                                 course_id;
//                                             console.log(
//                                                 "course_iddddddddddddddddddddddddd",
//                                                 course_id
//                                             );
//                                         }

//                                         if (courseDetail.class_id) {
//                                             class_id = await ClassModel.findOne(
//                                                 {
//                                                     classId:
//                                                         courseDetail.class_id,
//                                                 }
//                                             );
//                                             courseAdditionalData.class_id =
//                                                 class_id;
//                                         }

//                                         if (courseDetail.division_id) {
//                                             division_id =
//                                                 await DivisionModel.findOne({
//                                                     divisionId:
//                                                         courseDetail.division_id,
//                                                 });
//                                             console.log(
//                                                 "division_id",
//                                                 division_id.Name
//                                             );
//                                             courseAdditionalData.division_id =
//                                                 division_id;
//                                         }
// console.log("qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",course_id);
//                                         return {
//                                             courseName: course_id.CourseName,
//                                             courseFee: course_id.Fees,
//                                             className: class_id.name,
//                                             divisionName: division_id.Name,
//                                         };
//                                     }
//                                 )
//                             );

//                         additionalData.courseDetails =
//                             courseDetailsWithAdditionalData;
//                     }

//                     // Process fees details
//                     if (service.feesDetails && service.feesDetails.length > 0) {
//                         const feesDetailsWithAdditionalData = await Promise.all(
//                             service.feesDetails.map(async (feesDetail) => {
//                                 let feesAdditionalData = {};

//                                 if (feesDetail.feesTemplateId) {
//                                     const feesTemplateId =
//                                         await feesTemplateModel.findOne({
//                                             feesTemplateId:
//                                                 feesDetail.feesTemplateId,
//                                         });
//                                     feesAdditionalData.feesTemplateId =
//                                         feesTemplateId;
//                                 }

//                                 return { ...feesDetail, ...feesAdditionalData };
//                             })
//                         );

//                         additionalData.feesDetails =
//                             feesDetailsWithAdditionalData;
//                     }

//                     return { ...service._doc, ...additionalData };
//                 })
//             );
//             // Fetch feesPayment data based on specific IDs
//             const feesPaymentData = await FeesPaymentModel.find({
//                 groupId: groupId,
//                 empId: query.empId,
//                 addmissionId: query.addmissionId,
//             });

//             // let response1;
//             let modifiedFeesPaymentData = [];
//             let response1 = [];

//             for (const feesPayment of feesPaymentData) {
//                 try {
//                     const addmissionData = await studentAdmissionModel.findOne({
//                         addmissionId: feesPayment.addmissionId,
//                     });

//                     if (addmissionData) {
//                         const feesDetailsWithAdditionalData = [];
//                         for (const feesDetail of addmissionData.courseDetails) {
//                             let feesAdditionalData = {};

//                             if (feesDetail.course_id) {
//                                 const courseData = await courseModel.findOne({
//                                     courseId: feesDetail.course_id,
//                                 });
//                                 console.log("courseDatacourseDatacourseDatacourseDatacourseData", courseData);
//                                 feesAdditionalData.course_id = courseData
//                                     ? courseData.CourseName
//                                     : "";
//                             }

//                             feesDetailsWithAdditionalData.push({
//                                 ...feesDetail,
//                                 ...feesAdditionalData,
//                             });
//                             console.log("feesAdditionalData", feesAdditionalData);
//                         }

//                         const convertedObject =
//                             feesDetailsWithAdditionalData.reduce(
//                                 (acc, course) => {
//                                     console.log("fffffffffffffffffff", course);
//                                     acc = { courseName: course.course_id };
//                                     return acc;
//                                 },
//                                 {}
//                             );
//                         console.log("tttttttttttttttttttttttttttttttttt", convertedObject);
//                         response1.push({
//                             ...feesPayment._doc,
//                             courseName: convertedObject.courseName,
//                         });
//                         modifiedFeesPaymentData.push(
//                             ...feesDetailsWithAdditionalData
//                         );
//                     }
//                 } catch (error) {
//                     console.error(
//                         "Error fetching data from studentAdmissionModel:",
//                         error
//                     );
//                     modifiedFeesPaymentData.push(feesPayment);
//                 }
//             }

//             console.log(
//                 "feesDetailsWithAdditionalData:",
//                 modifiedFeesPaymentData
//             );
//             console.log("Response1:", response1);

//             console.log("Modified Fees Payment Data:", modifiedFeesPaymentData);
//             const filteredData = servicesWithData.filter((data) => {
//                 return (
//                     data.groupId === parseInt(groupId) &&
//                     data.empId === query.empId &&
//                     data.addmissionId == query.addmissionId,
//                     true
//                 );
//             });

//             const response = {
//                 status: "Success",
//                 data: {
//                     items: filteredData,
//                     feesPaymentData: response1,
//                     totalItemsCount: filteredData.length,
//                 },
//             };

//             return response;
//         } catch (error) {
//             console.error("Error:", error);
//             throw error;
//         }
//     }
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
                let categoryData;
                let religionData;
                let additionalData = {};

                if (service.caste) {
                    categoryData = await categoryModel.findOne({
                        categoriseId: service.caste,
                    });
                    additionalData.caste = categoryData ;
                }

                if (service.religion) {
                    try {
                        const religionData = await religionModel.findOne({
                            religionId: service.religion,
                        });
                
                        additionalData.religion = religionData;
                    } catch (error) {
                        console.error("Error fetching data from religionModel:", error);
                    }
                }
                

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

                                        course_id =
                                            await courseModel.findOne({
                                                courseId:
                                                    courseDetail.course_id,
                                            });

                                        courseAdditionalData.course_id =
                                            course_id;
                                    }

                                    if (courseDetail.class_id) {
                                        class_id = await ClassModel.findOne(
                                            {
                                                classId:
                                                    courseDetail.class_id,
                                            }
                                        );
                                        courseAdditionalData.class_id =
                                            class_id;
                                    }
                                    if (courseDetail.division_id) {
                                        division_id =
                                            await DivisionModel.findOne({
                                                divisionId:
                                                    courseDetail.division_id,
                                            });

                                        courseAdditionalData.division_id =
                                            division_id;
                                    }
                                    return {
                                        courseName: course_id?.courseName,
                                        courseFee: course_id?.fees,
                                        className: class_id?.name,
                                        divisionName: division_id?.Name,
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
        let response1 = [];

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
                                courseId: feesDetail.course_id,
                            });
                            feesAdditionalData.course_id = courseData
                                ? courseData.courseName
                                : "";
                        }

                        feesDetailsWithAdditionalData.push({
                            ...feesDetail,
                            ...feesAdditionalData,
                        });
                    }

                    const convertedObject =
                        feesDetailsWithAdditionalData.reduce(
                            (acc, course) => {
                                acc = { courseName: course.course_id };
                                return acc;
                            },
                            {}
                        );
                    response1.push({
                        ...feesPayment._doc,
                        courseName: convertedObject.courseName,
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
   
    async findLatestAdmission() {
        try {
            // Find the latest student admission based on the createdAt field in descending order
            const latestAdmission = await studentAdmissionModel
                .findOne()
                .sort({ createdAt: -1 });
            console.log("latestAdmission", latestAdmission);
            return latestAdmission;
        } catch (error) {
            console.error(error);
            return { error: "Failed to find the latest admission." };
        }
    }
    async getAdmissionListing(groupId, academicYear) {
        try {
            let courseData = await courseModel.find({ groupId: groupId });
            // console.log(courseIds);
            let admissionData = await StudentsAdmissionModel.find({
                groupId: groupId,
                academicYear:academicYear
            });
            let coursePayments = {};
            let courseID;
                let courseFee;
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

                            // const paymentsForCourse = feesData.filter(
                            //     (payment) =>
                            //         payment.addmissionId ===
                            //         admission.addmissionId
                            // );
                            // const paidAmountForCourse =
                            //     paymentsForCourse.reduce(
                            //         (total, payment) =>
                            //             total +
                            //             parseFloat(payment.paidAmount || 0),
                            //         0
                            //     );
                            // const remainingAmountForCourse =
                            //     paymentsForCourse.reduce(
                            //         (total, payment) =>
                            //             total +
                            //             parseFloat(
                            //                 payment.remainingAmount || 0
                            //             ),
                            //         0
                            //     );

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

                            // coursePayments[courseName].totalPaidAmount +=
                            //     paidAmountForCourse;

                            // coursePayments[
                            //     courseName
                            // ].totalRemainingAmount +=
                            //     remainingAmountForCourse;
                        }
                    });
                }
            });
            let formattedCoursePayments = Object.keys(coursePayments).map(
                (courseName) => {
                    return {
                        name: courseName,
                        id: coursePayments[courseName].courseId,
                        count: coursePayments[courseName].courseFee*coursePayments[courseName].noOfStudents ,
                        noOfStudents:
                            coursePayments[courseName].noOfStudents || 0,
                        // // totalPaidAmount:
                        //     coursePayments[courseName].totalPaidAmount,
                        // totalRemainingAmount:
                        //     coursePayments[courseName].totalRemainingAmount,
                    };
                }
            );
            let response={
                data: formattedCoursePayments,
            }
            // for (const courseId of courseIds) {
            //     const courseInfo = await courseModel.findOne({ courseId:courseId, groupId:groupId}, { courseName: 1 });
            //     // console.log(courseInfo);
            //     let studentCount = 0;

            //     const studentData = await studentAdmissionModel.find({ groupId: groupId, academicYear: academicYear });

            //     if (studentData) {
            //         studentData.forEach(item => {
            //             if (item.courseDetails && Array.isArray(item.courseDetails)) {
            //                 item.courseDetails.forEach(element => {
            //                     if (element.course_id === courseId) {
            //                         studentCount++;
            //                     }
            //                 });
            //             }
            //         });
            //     }

            //     courseData.push({
            //         // courseId,
            //         courseName: courseInfo ? courseInfo.courseName : null,
            //         studentCount,
            //     });
            // }

            // console.log(courseData);
            return response;
        } catch (error) {
            console.error(error);
            throw new Error("Error getting admission listing");
        }
    }
    async  getPendingInstallmentByAdmissionId(addmissionId) {
        try {
            const pipeline = [
                {
                    $match: {
                        addmissionId: addmissionId
                    }
                },
                {
                    $project: {
                        addmissionId: 1,
                        groupId: 1,
                        academicYear: 1,
                        courseDetails: 1,
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
                                            in: { $eq: ["$$installment.status", "pending"] }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            ];
    
            console.log("Pipeline:", JSON.stringify(pipeline)); // Log the pipeline
    
            const result = await studentAdmissionModel.aggregate(pipeline);
    
            console.log("Result:", result); // Log the result
    
            return result;
        } catch (error) {
            console.error("Error retrieving pending installment:", error);
            throw error;
        }
    }
    async  updateInstallmentAmount(installmentId, newAmount) {
        console.log(installmentId, newAmount);
        try {
            const updateResult = await studentAdmissionModel.findOneAndUpdate(
                { "feesDetails.installment.installmentNo": installmentId },
                { $set: { "feesDetails.$[outer].installment.$[inner].amount": newAmount } },
                { arrayFilters: [{ "outer.installment.installmentNo": installmentId }, { "inner.installmentNo": installmentId }], multi: true, new: true }
            );
    
            console.log("Installment amount updated successfully:", updateResult);
        } catch (error) {
            console.error("Error updating installment amount:", error);
        }
    }
    
    // async bulkUpload(headers, dataRows, userId) {
    //     try {
    //         const studentAdmissionId = Date.now();
    //         for (const row of dataRows) {
    //             if (row.every(value => value === null || value === '')) {
    //                 continue;
    //             }

    //             const obj = {};
    //             headers.forEach((header, index) => {
    //                 obj[header] = row[index];
    //             });

    //             // Validate smart_id uniqueness
    //             const existingSmartIdRecord = await studentAdmissionModel.findOne({ "securitySettings.smart_id": obj.smart_id });
    //             if (existingSmartIdRecord) {
    //                 throw new Error(`${ obj.smart_id } Smart ID already exists`);
    //             }

    //             const courseName = obj.courseName;
    //             const { courseId, classId, divisionId } = await this.getIdsByCourseName(courseName);
    //             const religionName = obj.religion;
    //             const { religionId } = await this.getReligionId(religionName,obj.groupId);
    //             console.log(religionId)
    //             const name = obj.name;
    //             const { TemplateId } = await this.getTemplateIDbyCourseName(name);
    //             const subjectsArray = obj.subjects.split(',');

    //             const phoneNumber = String(obj.phoneNumber).trim();
    //             const phone = String(obj.phone).trim();

    //             // Validate phone numbers
    //             if (!phoneNumber || !phone || phoneNumber.length !== 10 || phone.length !== 10) {
    //                 throw new Error('Invalid phone number');

    //             }

    //             // Check if phone number already exists in the database
    //             const existingPhoneNumberRecord = await studentAdmissionModel.findOne({ $or: [{ phoneNumber: phoneNumber }, { phone: phone }] });
    //             if (existingPhoneNumberRecord) {
    //                 throw new Error('Phone number already exists');
    //             }
    //             console.log(existingPhoneNumberRecord)

    //             // Construct payload
    //             const payload = {
    //                 studentAdmissionId: studentAdmissionId,
    //                 academicYear: obj.adcedemicYear,
    //                 caste: obj.caste,
    //                 dateOfBirth: obj.dateOfBirth,
    //                 document: [obj.document],
    //                 email: obj.email,
    //                 firstName: obj.firstName,
    //                 lastName: obj.lastName,
    //                 middleName: obj.middleName,
    //                 empId: obj.empId,
    //                 gender: obj.gender,
    //                 location: obj.location,
    //                 name: obj.name,
    //                 password: obj.password,
    //                 phoneNumber: phoneNumber,
    //                 profile_img: obj.profile_img,
    //                 religion: obj.religion,
    //                 religionId: religionId,
    //                 roleId: obj.roleId,
    //                 title: obj.title,
    //                 userId: obj.userId,
    //                 familyDetails: [
    //                     {
    //                         father_name: obj.father_name,
    //                         mother_name: obj.mother_name,
    //                         guardian_name: obj.guardian_name,
    //                         father_phone_number: obj.father_phone_number,
    //                         mother_phone_number: obj.mother_phone_number,
    //                         guardian_phone_number: obj.guardian_phone_number,
    //                         emergency_contact: [
    //                             {
    //                                 contact_name: obj.contact_name,
    //                                 phone_number: obj.phone_number,
    //                                 relationship: obj.relationship,
    //                             },
    //                         ],
    //                     },
    //                 ],
    //                 contactDetails: [
    //                     {
    //                         phone: phone,
    //                         email: obj.email,
    //                         whats_app: obj.whats_app,
    //                         facebook: obj.facebook,
    //                         instagram: obj.instagram,
    //                         linked_in: obj.linked_in,
    //                     },
    //                 ],
    //                 securitySettings: [
    //                     {
    //                         smart_id: obj.smart_id,
    //                         subscribe_on_whatsapp: obj.subscribe_on_whatsapp,
    //                         public_profile_url: obj.public_profile_url,
    //                     },
    //                 ],
    //                 courseDetails: {
    //                     course_id: courseId,
    //                     class_id: classId,
    //                     division_id: divisionId,
    //                     subjects: subjectsArray,
    //                 },
    //                 feesDetails: [
    //                     {
    //                         feesTemplateId: TemplateId,
    //                         installment: [
    //                             {
    //                                 amount: obj.amount,
    //                                 date: obj.date,
    //                                 numberOfInstalment: obj.numberOfInstalment,
    //                                 installmentNo: obj.installmentNo,
    //                                 status: obj.status,
    //                             },
    //                         ],
    //                     },
    //                 ],
    //                 installmentId: obj.installmentId,
    //                 createdBy: userId,
    //                 updatedBy: userId,
    //             };

    //             // Insert payload into the database
    //             const result = await studentAdmissionModel.insertMany(payload);

    //             return {
    //                 message: 'Data uploaded successfully',
    //                 data: result,
    //             };
    //         }
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    //original

    //     async  bulkUpload(dataRows,userId) {
    //         try {

    //             let data;
    // //   console.log("ddddddddddddddddddddd", dataRows);
    //   dataRows.forEach((row) => { data=row})

    // console.log("jjjjjjjjjjjjjjjjjjjjjjj",data);
    //             const existingSmartIdRecord = await studentAdmissionModel.findOne({ "securitySettings.smart_id": data.smart_id });
    //             if (existingSmartIdRecord) {
    //                 throw new Error(`${ data.smart_id } Smart ID already exists`);
    //             }

    //             const CourseName = data.courseName;
    //             let groupId=data.groupId
    //             console.log("courseName",CourseName);
    //             const { courseId, classId, divisionId } = await this.getIdsByCourseName(groupId,CourseName);
    //             console.log(" courseId, classId, divisionId  courseId, classId, divisionId  courseId, classId, divisionId ", courseId, classId, divisionId );
    //             const religionName = data.religion;

    //             const { religionId } = await this.getReligionId(religionName,data.groupId);
    //             console.log(religionId)
    //             const name = data.name_2;

    //             const { TemplateId } = await this.getTemplateIDbyCourseName(name);
    //             const subjectsArray = data.subjects.split(',');

    //             const phoneNumber = String(data.phoneNumber).trim();
    //             const phone = String(data.phone).trim();

    //             // Validate phone numbers
    //             if (!phoneNumber || !phone || phoneNumber.length !== 10 || phone.length !== 10) {
    //                 throw new Error('Invalid phone number');

    //             }

    //             // Check if phone number already exists in the database
    //             const existingPhoneNumberRecord = await studentAdmissionModel.findOne({ $or: [{ phoneNumber: phoneNumber }, { phone: phone }] });
    //             if (existingPhoneNumberRecord) {
    //                 throw new Error('Phone number already exists');
    //             }
    //             console.log(existingPhoneNumberRecord)
    //             const queries = dataRows.map((obj) => {
    //                 const studentAdmissionId = Date.now() + Math.floor(Math.random() * 1000000);
    //                 return {

    //                             studentAdmissionId: studentAdmissionId,
    //                             academicYear: obj.adcedemicYear,
    //                             caste: obj.caste,
    //                             groupId: obj.groupId,
    //                             dateOfBirth: obj.dateOfBirth,
    //                             document: [obj.document],
    //                             email: obj.email,
    //                             firstName: obj.firstName,
    //                             lastName: obj.lastName,
    //                             middleName: obj.middleName,
    //                             empId: obj.empId,
    //                             gender: obj.gender,
    //                             location: obj.location,
    //                             name: obj.name,
    //                             password: obj.password,
    //                             phoneNumber: phoneNumber,
    //                             profile_img: obj.profile_img,
    //                             religion: obj.religion,
    //                             religionId: religionId,
    //                             roleId: obj.roleId,
    //                             title: obj.title,
    //                             userId: obj.userId,
    //                             familyDetails: [
    //                                 {
    //                                     father_name: obj.father_name,
    //                                     mother_name: obj.mother_name,
    //                                     guardian_name: obj.guardian_name,
    //                                     father_phone_number: obj.father_phone_number,
    //                                     mother_phone_number: obj.mother_phone_number,
    //                                     guardian_phone_number: obj.guardian_phone_number,
    //                                     emergency_contact: [
    //                                         {
    //                                             contact_name: obj.contact_name,
    //                                             phone_number: obj.phone_number,
    //                                             relationship: obj.relationship,
    //                                         },
    //                                     ],
    //                                 },
    //                             ],
    //                             contactDetails: [
    //                                 {
    //                                     phone: phone,
    //                                     email: obj.email,
    //                                     whats_app: obj.whats_app,
    //                                     facebook: obj.facebook,
    //                                     instagram: obj.instagram,
    //                                     linked_in: obj.linked_in,
    //                                 },
    //                             ],
    //                             securitySettings: [
    //                                 {
    //                                     smart_id: obj.smart_id,
    //                                     subscribe_on_whatsapp: obj.subscribe_on_whatsapp,
    //                                     public_profile_url: obj.public_profile_url,
    //                                 },
    //                             ],
    //                             courseDetails: {
    //                                 course_id: courseId,
    //                                 class_id: classId,
    //                                 division_id: divisionId,
    //                                 subjects: subjectsArray,
    //                             },
    //                             feesDetails: [
    //                                 {
    //                                     feesTemplateId: TemplateId,
    //                                     installment: [
    //                                         {
    //                                             amount: obj.amount,
    //                                             date: obj.date,
    //                                             numberOfInstalment: obj.numberOfInstalment,
    //                                             installmentNo: obj.installmentNo,
    //                                             status: obj.status,
    //                                         },
    //                                     ],
    //                                 },
    //                             ],
    //                             installmentId: obj.installmentId,
    //                             createdBy: obj.createdBy,
    //                             updatedBy: obj.updatedBy,

    //                 };
    //             });
    //             const result = await studentAdmissionModel.insertMany(queries);
    //     // console.log("gggggggggggggggggggggggggggg",result);
    //                 return result
    //         } catch (error) {
    //             console.log(error);
    //             throw error;
    //         }
    //     }

    async bulkUpload(dataRows, userId) {
        try {
            let results = [];

            for (let i = 0; i < dataRows.length; i++) {
                const data = dataRows[i];
                const CourseName = data.courseName;
                const className = data.class;
                const divisionName = data.division;
                const groupId = data.groupId;
                console.log("divisionNamedddddddddddddddd", divisionName);
                const { courseId, classId, divisionId } =
                    await this.getIdsByCourseName(
                        groupId,
                        CourseName,
                        className,
                        divisionName
                    );
                const religionName = data.religion;
                const { religionId } = await this.getReligionId(
                    religionName,
                    groupId
                );
                const casteName = data.caste;
                const { categoriseId } = await this.getCategoryId(
                    casteName,
                    groupId
                );
                const academicYear = data.academicYear;
                const { academicYearId } = await this.getAcademicYear(
                    academicYear,
                    groupId
                );
                const name = data.feesTemplateName;
                const { TemplateId } = await this.getTemplateIDbyCourseName(
                    name
                );

                const phoneNumber = String(data.phoneNumber).trim();
                const phone = String(data.contactDetails_phone).trim();

                if (
                    !phoneNumber ||
                    !phone ||
                    phoneNumber.length !== 10 ||
                    phone.length !== 10
                ) {
                    throw new Error("Invalid phone number");
                }

                const existingPhoneNumberRecord =
                    await studentAdmissionModel.findOne({
                        $or: [{ phoneNumber: phoneNumber }, { phone: phone }],
                    });

                if (existingPhoneNumberRecord) {
                    throw new Error("Phone number already exists");
                }

                const studentAdmissionId =
                    Date.now() + Math.floor(Math.random() * 1000000);
                const query = {
                    addmissionId: studentAdmissionId,
                    academicYear: academicYearId,
                    caste: categoriseId,
                    groupId: data.groupId,
                    dateOfBirth: data.dateOfBirth,
                    document: [data.document],
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    middleName: data.middleName,
                    empId: data.empId,
                    gender: data.gender,
                    location: data.location,
                    name: data.name,
                    password: data.password,
                    phoneNumber: phoneNumber,
                    profile_img: data.profile_img,
                    // religion: data.religion,
                    religion: religionId,
                    roleId: data.roleId,
                    title: data.title,
                    userId: data.userId,
                    familyDetails: [
                        {
                            father_name: data.father_name,
                            mother_name: data.mother_name,
                            guardian_name: data.guardian_name,
                            father_phone_number: data.father_phone_number,
                            mother_phone_number: data.mother_phone_number,
                            guardian_phone_number: data.guardian_phone_number,
                            emergency_contact: [
                                {
                                    contact_name: data.contact_name,
                                    phone_number: data.phone_number,
                                    relationship: data.relationship,
                                },
                            ],
                        },
                    ],
                    contactDetails: [
                        {
                            phone: phone,
                            email: data.contactDetails_email,
                            whats_app: data.contactDetails_whats_app,
                            facebook: data.contactDetails_facebook,
                            instagram: data.contactDetails_instagram,
                            linked_in: data.contactDetails_linked_in,
                        },
                    ],
                    securitySettings: [
                        {
                            smart_id: data.securitySettings_smart_id,
                            subscribe_on_whatsapp: data.securitySettings_subscribe_on_whatsapp,
                            public_profile_url: data.securitySettings_public_profile_url,
                        },
                    ],
                    courseDetails: [{
                        course_id: courseId,
                        class_id: classId,
                        division_id: divisionId,
                        subjects: data.subjects.split(","),
                    }],
                    feesDetails: [
                        {
                            feesTemplateId: TemplateId,
                            installment: [
                                {
                                    amount: data.amount,
                                    date: data.date,
                                    numberOfInstalment: data.numberOfInstalment,
                                    installmentNo: data.installmentNo,
                                    status: data.status,
                                },
                            ],
                        },
                    ],
                   
                    installmentId: data.installmentId,
                    reference: [
                        {
                            name: data.reference_Name,
                            phone_number: data.reference_Mobile,
                            relationship: data.reference_Relentionship,
                            email: data.reference_Email,
                        },
                    ],
                    createdBy: data.createdBy,
                    updatedBy: data.updatedBy,
                };

                const result = await studentAdmissionModel.create(query);
                results.push(result);
            }

            return results;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getIdsByCourseName(groupId, CourseName, className, divisionName) {
        try {
            const course = await courseModel.findOne({
                groupId: groupId,
                CourseName: CourseName,
            });

            const courseId = course ? course.courseId : null;

            const classInfo = await ClassModel.findOne({
                groupId: groupId,
                name: className,
            });

            const classId = classInfo ? classInfo.classId : null;

            const divisionInfo = await DivisionModel.findOne({
                groupId: groupId,
                Name: divisionName,
            });

            const divisionId = divisionInfo ? divisionInfo.divisionId : null;

            return {
                courseId: courseId,
                classId: classId,
                divisionId: divisionId,
            };
        } catch (error) {
            throw error;
        }
    }

    async getReligionId(religion, groupId) {
        religion = religion;
        groupId = groupId;
        console.log(
            "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            religion,
            groupId
        );
        let religionName = await religionModel.findOne({
            religion: { $regex: new RegExp(religion, "i") },
            groupId: groupId,
        });

        if (!religionName) {
            throw new Error(`Religion with provided criteria not found`);
        }

        console.log("religionName", religionName.religionId);
        const religionId = religionName.religionId;
        return {
            religionId,
        };
    }
    async getCategoryId(name, groupId) {
        name = name;
        groupId = groupId;
        console.log(
            "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            name,
            groupId
        );
        let casteName = await CategoriesModel.findOne({
            name: { $regex: new RegExp(name, "i") },
            groupId: groupId,
        });

        if (!casteName) {
            throw new Error(`caste with provided criteria not found`);
        }

       
        const categoriseId = casteName.categoriseId;
        return {
            categoriseId,
        };
    }
    async getAcademicYear(year, groupId) {
        year = year;
        groupId = groupId;
        console.log(
            "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            year,
            groupId
        );
        let academicYearName = await AcademicYearModel.findOne({
            year: { $regex: new RegExp(year, "i") },
            groupId: groupId,
        });

        if (!academicYearName) {
            throw new Error(`academicYear with provided criteria not found`);
        }

       
        const academicYearId = academicYearName.academicYearId;
        return {
            academicYearId,
        };
    }

    async getTemplateIDbyCourseName(name) {
        let name1 = await feesTemplateModel.findOne({ name: name });
        const TemplateId = name1?.feesTemplateId;
        return {
            TemplateId,
        };
    }


    async getAllSearchDataByGroupId(groupId, criteria, skip, limit) {
        try {
            const searchFilter = {
                groupId: groupId,
            };
            let course_id;
            let class_id;
            let division_id;
            let feesTemplateId;
            criteria.pageSize = 10
            if (criteria.search) {
                const numericSearch = parseInt(criteria.search);
                if (!isNaN(numericSearch)) {
                    searchFilter.$or = [
                        { phoneNumber: numericSearch }
                    ]
                } else {
                    searchFilter.$or = [
                        { firstName: { $regex: criteria.search, $options: "i" } },
                        { lastName: { $regex: criteria.search, $options: "i" } },
                        { gender: { $regex: criteria.search, $options: "i" } },
                        {
                            location: {
                                $regex: criteria.search,
                                $options: "i",
                            },
                        },
                        { title: criteria.search },
                    ];
                }
            }
            if (criteria.religion) {
                searchFilter.religion = criteria.religion;
            }
            if (criteria.category) {
                searchFilter.category = criteria.category;
            }
            const students = await StudentsAdmissionModel.find(searchFilter).skip(skip)
                .limit(limit)
                .exec();

            if (students) {
                let data = students.forEach(item => {
                    let courseIds = item.courseDetails.forEach(
                        (element) => {
                            course_id = element.course_id;
                            class_id = element.class_id;
                            division_id = element.division_id;
                        }
                    );
                    let templateIds = item.feesDetails.forEach(
                        (element) => {
                            feesTemplateId = element.feesTemplateId;
                        }
                    );
                })

                const addmissionIds = students[0].addmissionId
                const installmentData=students[0].feesDetails[0].installment
                let courseDetails = await courseModel.findOne({
                    groupId: groupId,
                    courseId: course_id,
                }, { courseName: 1, fees: 1, _id: 0 });

                let classDetails = await ClassModel.findOne({
                    groupId: groupId,
                    classId: class_id,
                }, { name: 1, _id: 0 });

                let divisionDetails = await DivisionModel.findOne({
                    groupId: groupId,
                    divisionId: division_id
                }, { Name: 1, _id: 0 })

                let feesPaymentDetails = await feesPaymentModel.findOne({
                    groupId: groupId,
                    addmissionId: addmissionIds
                }, { status: 1, paidAmount: 1, courseFee: 1, remainingAmount: 1,feesPaymentId:1, _id: 0 }).sort({ createdAt: -1 });

                const studantData = {
                    candidateName: `${students[0].firstName} ${students[0].middleName} ${students[0].lastName}`,
                    phoneNumber: students[0].phoneNumber,
                    addmissionId: addmissionIds,
                    empId: students[0].empId,
                    groupId: students[0].groupId,
                    installmentId: students[0].installmentId,
                    installments: installmentData,
                    courseName:courseDetails.courseName,
                    className: classDetails.name,
                    divisionName:divisionDetails.Name,
                    courseFees:feesPaymentDetails.courseFee,
                    status:feesPaymentDetails.status,
                    feesPaymentId: feesPaymentDetails.feesPaymentId,
                    paidAmount: feesPaymentDetails.paidAmount,
                    remainingAmount: feesPaymentDetails.remainingAmount
                }

                const count = await StudentsAdmissionModel.countDocuments(searchFilter)
                let response = {
                    servicesWithData: [studantData],
                    totalCount: count
                }
                return response;
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}
module.exports = new StudentsAdmmisionService(
    studentAdmissionModel,
    "studentAdmission"
);
