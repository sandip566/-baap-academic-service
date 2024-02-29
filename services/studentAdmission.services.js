const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const studentAdmissionModel = require("../schema/studentAdmission.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const feesInstallmentServices = require("./feesInstallment.services");
const StudentsAdmissionModel = require("../schema/studentAdmission.schema");
const courseModel = require("../schema/courses.schema");
const ClassModel = require("../schema/classes.schema");
const DivisionModel = require("../schema/division.schema");
const religionModel = require("../schema/religion.schema");
const SubjectModel = require("../schema/subjects.schema");
// const FeesTemplateModel = require("../schema/feesTemplate.schema");
const feesTemplateModel = require("../schema/feesTemplate.schema");

const FeesPaymentModel = require("../schema/feesPayment.schema");

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
                                            courseDetail.course_id &&
                                            courseDetail.course_id !== "null"
                                        ) {
                                            console.log(
                                                "ddddddddddddddddd",
                                                courseDetail.course_id
                                            );
                                            const course_id =
                                                await courseModel.findOne({
                                                    courseId:
                                                        courseDetail.course_id,
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
                                        if (courseDetail.class_id) {
                                            const classId = parseInt(
                                                courseDetail.class_id
                                            );
                                            if (!isNaN(classId)) {
                                                const class_id =
                                                    await DivisionModel.findOne(
                                                        {
                                                            classId: classId,
                                                        }
                                                    );
                                                additionalData.class_id =
                                                    class_id;
                                            } else {
                                                console.error(
                                                    "courseDetail.class_id is not a valid number:",
                                                    courseDetail.class_id
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
                                        if (courseDetail.division_id) {
                                            const divisionId = parseInt(
                                                courseDetail.division_id
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
                                                    courseDetail.division_id
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
                                            
                                            course_id =
                                                await courseModel.findOne({
                                                    courseId:
                                                        courseDetail.course_id,
                                                });

                                            courseAdditionalData.course_id =
                                                course_id;
                                            console.log(
                                                "course_iddddddddddddddddddddddddd",
                                                course_id
                                            );
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
                                            console.log(
                                                "division_id",
                                                division_id.Name
                                            );
                                            courseAdditionalData.division_id =
                                                division_id;
                                        }

                                        return {
                                            courseName: course_id.CourseName,
                                            courseFee: course_id.Fees,
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
                                console.log("courseDatacourseDatacourseDatacourseDatacourseData",courseData);
                                feesAdditionalData.course_id = courseData
                                    ? courseData.CourseName
                                    : "";
                            }

                            feesDetailsWithAdditionalData.push({
                                ...feesDetail,
                                ...feesAdditionalData,
                            });
                            console.log("yyyyyyyyyyyyyyyyyyyyyyyyyy",feesAdditionalData);
                        }

                        const convertedObject =
                            feesDetailsWithAdditionalData.reduce(
                                (acc, course) => {
                                    console.log("fffffffffffffffffff",course);
                                    acc = { courseName: course.course_id };
                                    return acc;
                                },
                                {}
                            );
                        console.log("tttttttttttttttttttttttttttttttttt",convertedObject);
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

            console.log(
                "feesDetailsWithAdditionalData:",
                modifiedFeesPaymentData
            );
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
                        console.log(courseDetail.course_id);
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
                            const courseId = matchingCourse.courseId.toString();
                            console.log("courseId", courseId);
                            const courseName =
                                matchingCourse.CourseName ||
                                matchingCourse.name;
                            const existingCourse = courseCounts.find(
                                (courseCount) =>
                                    courseCount.courseId === courseId
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
                const name = data.name_2;
                const { TemplateId } = await this.getTemplateIDbyCourseName(
                    name
                );

                const phoneNumber = String(data.phoneNumber).trim();
                const phone = String(data.phone).trim();

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
                    studentAdmissionId: studentAdmissionId,
                    academicYear: data.adcedemicYear,
                    caste: data.caste,
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
                    religion: data.religion,
                    religionId: religionId,
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
                            email: data.email,
                            whats_app: data.whats_app,
                            facebook: data.facebook,
                            instagram: data.instagram,
                            linked_in: data.linked_in,
                        },
                    ],
                    securitySettings: [
                        {
                            smart_id: data.smart_id,
                            subscribe_on_whatsapp: data.subscribe_on_whatsapp,
                            public_profile_url: data.public_profile_url,
                        },
                    ],
                    courseDetails: {
                        course_id: courseId,
                        class_id: classId,
                        division_id: divisionId,
                        subjects: data.subjects.split(","),
                    },
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

    async getTemplateIDbyCourseName(name) {
        let name1 = await feesTemplateModel.findOne({ name: name });
        const TemplateId = name1.feesTemplateId;
        return {
            TemplateId,
        };
    }


async getAllSearchDataByGroupId(groupId, criteria,skip,limit) {
    try {
        const searchFilter = {
            groupId: groupId,
        };
        criteria.pageSize=10
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
        const count=await StudentsAdmissionModel.countDocuments(searchFilter)
        let response={
            Data: [students],
            totalCount:count
        }
        return response;
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
