const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const studentAdmissionModel = require("../schema/studentAdmission.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const feesInstallmentServices = require("./feesInstallment.services");
const StudentsAdmissionModel = require("../schema/studentAdmission.schema");
const courseModel = require("../schema/courses.schema");
const ClassModel = require("../schema/classes.schema");
const DivisionModel = require("../schema/division.schema");
const religionModel = require("../schema/religion.schema");
const feesPaymentModel = require("../schema/feesPayment.schema");
const SubjectModel = require("../schema/subjects.schema");
const categoryModel = require("../schema/categories.schema");
const DepartmentModel = require("../schema/department.schema")
// const FeesTemplateModel = require("../schema/feesTemplate.schema");
const feesTemplateModel = require("../schema/feesTemplate.schema");
const assetrequestModel = require("../schema/assetrequest.schema");
const FeesPaymentModel = require("../schema/feesPayment.schema");
const CategoriesModel = require("../schema/categories.schema");
const AcademicYearModel = require("../schema/academicyear.schema");
const FeesInstallmentModel = require("../schema/feesInstallment.schema");
const studentModel = require("../schema/student.schema");

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

    async updateByUserId(groupId, userId, newData) {
        try {
            const updatedData = await studentAdmissionModel.findOneAndUpdate(
                { groupId: groupId, userId: userId },
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
    async deleteByStudentsAddmisionId(addmissionId, groupId) {
        try {
            const studentDeletionResult = await studentAdmissionModel.deleteOne(
                {
                    addmissionId: addmissionId,
                    groupId: groupId,
                }
            );

            const feesDeletionResult = await FeesInstallmentModel.deleteMany({
                addmissionId: addmissionId,
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
    async getByUserId(userId) {
        return this.execute(() => {
            return this.model.findOne({ userId: userId });
        });
    }

    async getByAddmissionId(addmissionId) {
        try {
            let data = await studentAdmissionModel
                .aggregate([
                    {
                        $match: {
                            addmissionId: Number(addmissionId),
                        },
                    },
                    {
                        $unwind: {
                            path: "$feesDetails",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: "feestemplates",
                            localField: "feesDetails.feesTemplateId",
                            foreignField: "feesTemplateId",
                            as: "feesDetails.feesTemplate",
                        },
                    },
                    {
                        $unwind: {
                            path: "$feesDetails.feesTemplate",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $unwind: {
                            path: "$courseDetails",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: "courses",
                            localField: "courseDetails.course_id",
                            foreignField: "courseId",
                            as: "courseDetails.course_id",
                        },
                    },
                    {
                        $unwind: {
                            path: "$courseDetails.course_id",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: "classes",
                            localField: "courseDetails.class_id",
                            foreignField: "classId",
                            as: "courseDetails.class_id",
                        },
                    },
                    {
                        $unwind: {
                            path: "$courseDetails.class_id",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: "divisions",
                            localField: "courseDetails.division_id",
                            foreignField: "divisionId",
                            as: "courseDetails.division_id",
                        },
                    },
                    {
                        $unwind: {
                            path: "$courseDetails.division_id",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: "departments",
                            localField: "courseDetails.department_id",
                            foreignField: "departmentId",
                            as: "courseDetails.department_id",
                        },
                    },
                    {
                        $unwind: {
                            path: "$courseDetails.department_id",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $group: {
                            _id: "$_id",
                            feesDetails: { $push: "$feesDetails" },
                            courseDetails: { $push: "$courseDetails" },
                            otherFields: { $first: "$$ROOT" },
                        },
                    },
                    {
                        $replaceRoot: {
                            newRoot: {
                                $mergeObjects: [
                                    "$otherFields",
                                    {
                                        feesDetails: "$feesDetails",
                                        courseDetails: "$courseDetails",
                                    },
                                ],
                            },
                        },
                    },
                ])
                .exec();

            const response = {
                status: "Success",
                data: data[0],

                totalItemsCount: data.length,
            };

            return response;
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }

    async getAllByGroupId(groupId, query, page, perPage, reverseOrder = true) {
        try {
            const searchFilter = {
                groupId: groupId,
                admissionStatus: "Confirm",
            };

            if (query.search) {
                const numericSearch = parseInt(query.search);
                if (!isNaN(numericSearch)) {
                    searchFilter.$or = [
                        { firstName: { $regex: query.search, $options: "i" } },
                        { lastName: { $regex: query.search, $options: "i" } },
                        { phoneNumber: numericSearch },
                        { addmissionId: numericSearch },
                    ];
                } else {
                    searchFilter.$or = [
                        { firstName: { $regex: query.search, $options: "i" } },
                        { lastName: { $regex: query.search, $options: "i" } },
                    ];
                }
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

            if (query.phoneNumber) {
                searchFilter.phoneNumber = query.phoneNumber;
            }

            if (query.className) {
                const classIds = await ClassModel.find({
                    name: { $regex: query.className, $options: "i" },
                }).select("classId");
                if (classIds && classIds.length > 0) {
                    searchFilter["courseDetails.class_id"] = {
                        $in: classIds.map((cls) => cls.classId),
                    };
                } else {
                    return { message: "No data found with the class name" };
                }
            }

            const skip = (page - 1) * perPage;
            const limit = perPage;

            const services = await studentAdmissionModel
                .find(searchFilter)
                .skip(skip)
                .limit(limit);

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
                                                " courseDetail?.course_id",
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

                                        if (courseDetail?.class_id) {
                                            const classId = parseInt(
                                                courseDetail?.class_id
                                            );
                                            if (!isNaN(classId)) {
                                                const class_id =
                                                    await ClassModel.findOne({
                                                        classId: classId,
                                                    });
                                                additionalData.class_id =
                                                    class_id;
                                            } else {
                                                console.error(
                                                    "courseDetail.class_id is not a valid number:",
                                                    courseDetail?.class_id
                                                );
                                            }
                                        }
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

            const totalItemsCount = await studentAdmissionModel.countDocuments(
                searchFilter
            );

            const response = {
                status: "Success",
                data: {
                    items: servicesWithData,
                    totalItemsCount: totalItemsCount,
                },
            };
            return response;
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }

    async getAllDataByGroupId(
        groupId,
        query,
        page,
        perPage,
        reverseOrder = true
    ) {
        try {
            const searchFilter = {
                groupId: groupId,
            };
            if (query.classId) {
                searchFilter["courseDetails.class_id"] = Number(query.classId);
                // searchFilter["courseDetails.subjects.subjectId"] = Number(
                //     query.subjectId
                // );
            }
            if (query.search) {
                const numericSearch = parseInt(query.search);
                if (!isNaN(numericSearch)) {
                    searchFilter.$or = [
                        { firstName: { $regex: query.search, $options: "i" } },
                        { lastName: { $regex: query.search, $options: "i" } },
                        { phoneNumber: numericSearch },
                        { addmissionId: numericSearch },
                        { userId: numericSearch },
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

            if (query.CourseName) {
                const courseIds = await courseModel
                    .find({
                        CourseName: { $regex: query.CourseName, $options: "i" },
                    })
                    .select("courseId");
                if (courseIds && courseIds.length > 0) {
                    searchFilter["courseDetails.course_id"] = {
                        $in: courseIds.map((course) => course.courseId),
                    };
                } else {
                    return { message: "No data found with the courseName" };
                }
            }

            if (query.className) {
                const classIds = await ClassModel.find({
                    name: { $regex: query.className, $options: "i" },
                }).select("classId");
                if (classIds && classIds.length > 0) {
                    searchFilter["courseDetails.class_id"] = {
                        $in: classIds.map((cls) => cls.classId),
                    };
                } else {
                    return { message: "No data found with the class name" };
                }
            }

            const skip = (page - 1) * perPage;
            const limit = perPage;

            const services = await studentAdmissionModel
                .find(searchFilter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: reverseOrder ? -1 : 1 });

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
                                                " courseDetail?.course_id",
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

                                        if (courseDetail?.class_id) {
                                            const classId = parseInt(
                                                courseDetail?.class_id
                                            );
                                            if (!isNaN(classId)) {
                                                const class_id =
                                                    await ClassModel.findOne({
                                                        classId: classId,
                                                    });
                                                additionalData.class_id =
                                                    class_id;
                                            } else {
                                                console.error(
                                                    "courseDetail.class_id is not a valid number:",
                                                    courseDetail?.class_id
                                                );
                                            }
                                        }
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

            // servicesWithData.sort((a, b) => {
            //     const dateA = new Date(a.createdAt);
            //     const dateB = new Date(b.createdAt);
            //     return reverseOrder ? dateB - dateA : dateA - dateB;
            // });

            const totalItemsCount = await studentAdmissionModel.countDocuments(
                searchFilter
            );

            const response = {
                status: "Success",
                data: {
                    items: servicesWithData,
                    totalItemsCount: totalItemsCount,
                },
            };
            return response;
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }

    async getMarkEntry(groupId, query, page, perPage) {
        try {
            const searchFilter = {
                groupId: Number(groupId),
                admissionStatus: "Confirm",
            };
            if (query.classId && query.subjectId) {
                searchFilter["courseDetails.class_id"] = Number(query.classId);
                searchFilter["courseDetails.subjects.subjectId"] = Number(
                    query.subjectId
                );
            }

            if (query.search) {
                const numericSearch = parseInt(query.search);
                if (!isNaN(numericSearch)) {
                    searchFilter.$or = [
                        { name: { $regex: query.search, $options: "i" } },
                        { lastName: { $regex: query.search, $options: "i" } },
                        { phoneNumber: numericSearch },
                        { addmissionId: numericSearch },
                        { userId: numericSearch },
                    ];
                } else {
                    searchFilter.$or = [
                        { name: { $regex: query.search, $options: "i" } },
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

            if (query.CourseName) {
                const courseIds = await courseModel
                    .find({
                        CourseName: { $regex: query.CourseName, $options: "i" },
                    })
                    .select("courseId");
                if (courseIds && courseIds.length > 0) {
                    searchFilter["courseDetails.course_id"] = {
                        $in: courseIds.map((course) => course.courseId),
                    };
                } else {
                    return { message: "No data found with the courseName" };
                }
            }

            if (query.className) {
                const classIds = await ClassModel.find({
                    name: { $regex: query.className, $options: "i" },
                }).select("classId");
                if (classIds && classIds.length > 0) {
                    searchFilter["courseDetails.class_id"] = {
                        $in: classIds.map((cls) => cls.classId),
                    };
                } else {
                    return { message: "No data found with the class name" };
                }
            }

            const skip = (page - 1) * perPage;
            const limit = perPage;

            const markEntry = await studentAdmissionModel
                .aggregate([
                    {
                        $match: searchFilter,
                    },
                    {
                        $unwind: {
                            path: "$courseDetails",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $unwind: {
                            path: "$courseDetails.subjects",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $match: {
                            "courseDetails.class_id": Number(query.classId),
                            "courseDetails.subjects.subjectId": Number(
                                query.subjectId
                            ),
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            docs: { $push: "$$ROOT" },
                        },
                    },
                    {
                        $unwind: {
                            path: "$docs",
                            includeArrayIndex: "serialNo",
                        },
                    },
                    {
                        $replaceRoot: {
                            newRoot: {
                                $mergeObjects: [
                                    "$docs",
                                    { serialNo: { $add: ["$serialNo", 1] } },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            serialNo: 1,
                            _id: 1,
                            groupId: 1,
                            addmissionId: 1,
                            academicYear: 1,
                            userId: 1,
                            name: 1,
                            admissionStatus: 1,
                            status: 1,
                            email: 1,
                            phoneNumber: 1,
                            "courseDetails.department_id": 1,
                            "courseDetails.course_id": 1,
                            "courseDetails.class_id": 1,
                            "courseDetails.division_id": 1,
                            "courseDetails.subjects": 1,
                        },
                    },
                    {
                        $skip: skip,
                    },
                    {
                        $limit: limit,
                    },
                ])
                .exec();

            const totalItemsCount = await studentAdmissionModel.countDocuments(
                searchFilter
            );

            const response = {
                status: "Success",
                data: {
                    items: markEntry,
                    totalItemsCount: totalItemsCount,
                },
            };
            return response;
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }

    async getDonationDataByGroupId(
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
                        { addmissionId: numericSearch },
                    ];
                } else {
                    searchFilter.$or = [
                        { firstName: { $regex: query.search, $options: "i" } },
                        { lastName: { $regex: query.search, $options: "i" } },
                        { name: { $regex: query.search, $options: "i" } },
                        { phoneNumber: query.search },
                    ];
                }
            }

            if (query.phoneNumber) {
                searchFilter.phoneNumber = query.phoneNumber;
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

            if (query.CourseName) {
                const courseIds = await courseModel
                    .find({
                        CourseName: { $regex: query.CourseName, $options: "i" },
                    })
                    .select("courseId");
                if (courseIds && courseIds.length > 0) {
                    searchFilter["courseDetails.course_id"] = {
                        $in: courseIds.map((course) => course.courseId),
                    };
                } else {
                    return { message: "No data found with the courseName" };
                }
            }

            if (query.className) {
                const classIds = await ClassModel.find({
                    name: { $regex: query.className, $options: "i" },
                }).select("classId");
                if (classIds && classIds.length > 0) {
                    searchFilter["courseDetails.class_id"] = {
                        $in: classIds.map((cls) => cls.classId),
                    };
                } else {
                    return { message: "No data found with the class name" };
                }
            }

            const currentPage = page;
            const perPage = limit;
            const skip = (currentPage - 1) * perPage;

            const pipeline = [
                { $match: searchFilter },
                {
                    $unwind: "$feesDetails",
                },
                {
                    $lookup: {
                        from: "feestemplates",
                        localField: "feesDetails.feesTemplateId",
                        foreignField: "feesTemplateId",
                        as: "feeTemplateData",
                    },
                },
                {
                    $addFields: {
                        "feesDetails.feesTemplateId": {
                            $arrayElemAt: ["$feeTemplateData", 0],
                        },
                    },
                },
                {
                    $match: {
                        "feeTemplateData.isShowInAccounting": false,
                    },
                },
                {
                    $lookup: {
                        from: "courses",
                        localField: "courseDetails.course_id",
                        foreignField: "courseId",
                        as: "course_id",
                    },
                },
                {
                    $addFields: {
                        "courseDetails.course_id": {
                            $arrayElemAt: ["$course_id", 0],
                        },
                    },
                },
                {
                    $lookup: {
                        from: "classes",
                        localField: "courseDetails.class_id",
                        foreignField: "classId",
                        as: "class_id",
                    },
                },
                {
                    $addFields: {
                        "courseDetails.class_id": {
                            $arrayElemAt: ["$class_id", 0],
                        },
                    },
                },
                {
                    $lookup: {
                        from: "divisions",
                        localField: "courseDetails.division_id",
                        foreignField: "divisionId",
                        as: "division_id",
                    },
                },
                {
                    $addFields: {
                        "courseDetails.division_id": {
                            $arrayElemAt: ["$division_id", 0],
                        },
                    },
                },
                {
                    $lookup: {
                        from: "departments",
                        localField: "courseDetails.department_id",
                        foreignField: "departmentId",
                        as: "department_id",
                    },
                },
                {
                    $addFields: {
                        "courseDetails.department_id": {
                            $arrayElemAt: ["$department_id", 0],
                        },
                    },
                },
                {
                    $unset: "course_id",
                },
                {
                    $unset: "department_id",
                },
                {
                    $unset: "division_id",
                },
                {
                    $unset: "class_id",
                },
                {
                    $unset: "feeTemplateData",
                },

                { $skip: skip },
                { $limit: perPage },
                { $sort: { _id: -1 } },
            ];

            const servicesWithData = await studentAdmissionModel.aggregate(
                pipeline
            );
            servicesWithData.sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return reverseOrder ? dateB - dateA : dateA - dateB;
            });

            const totalItemsCount = await studentAdmissionModel.aggregate([
                { $match: searchFilter },
                {
                    $unwind: "$feesDetails",
                },
                {
                    $lookup: {
                        from: "feestemplates",
                        localField: "feesDetails.feesTemplateId",
                        foreignField: "feesTemplateId",
                        as: "feeTemplateData",
                    },
                },
                {
                    $match: {
                        "feeTemplateData.isShowInAccounting": false,
                    },
                },
                {
                    $count: "totalItemsCount",
                },
            ]);

            const response = {
                status: "Success",
                data: {
                    items: servicesWithData,
                    totalItemsCount: totalItemsCount[0]?.totalItemsCount,
                },
            };
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
            // if (query.academicYear) {
            //     searchFilter.academicYear = query.academicYear;
            // }
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
                                        if (courseDetail?.course_id) {
                                            course_id =
                                                await courseModel.findOne({
                                                    courseId:
                                                        courseDetail.course_id,
                                                });

                                            courseAdditionalData.course_id =
                                                course_id;
                                        }

                                        if (courseDetail?.class_id) {
                                            class_id = await ClassModel.findOne(
                                                {
                                                    classId:
                                                        courseDetail.class_id,
                                                }
                                            );
                                            courseAdditionalData.class_id =
                                                class_id;
                                        }
                                        if (courseDetail?.division_id) {
                                            division_id =
                                                await DivisionModel.findOne({
                                                    divisionId:
                                                        courseDetail.division_id,
                                                });

                                            courseAdditionalData.division_id =
                                                division_id;
                                        }
                                        return {
                                            courseName: course_id?.CourseName,
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
            // Fetch feesPayment data based on specific IDs
            const feesPaymentData = await FeesPaymentModel.find({
                groupId: Number(groupId),
                empId: query.empId,
                addmissionId: query.addmissionId,
                academicYear: query.academicYear,
            });
            console.log(feesPaymentData);

            // let response1;
            let modifiedFeesPaymentData = [];
            let response1 = [];

            for (const feesPayment of feesPaymentData) {
                try {
                    const addmissionData = await studentAdmissionModel.findOne({
                        addmissionId: feesPayment.addmissionId,
                        // academicYear: feesPayment.academicYear
                    });

                    if (addmissionData) {
                        const feesDetailsWithAdditionalData = [];
                        for (const feesDetail of addmissionData.courseDetails) {
                            let feesAdditionalData = {};

                            if (feesDetail?.course_id) {
                                const courseData = await courseModel.findOne({
                                    courseId: feesDetail?.course_id,
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
                                    acc = { courseName: course?.course_id };
                                    return acc;
                                },
                                {}
                            );
                        response1.push({
                            ...feesPayment._doc,
                            courseName: convertedObject?.courseName,
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
    async getIndividualStudentData(groupId, query) {
        try {
            const userId = Number(query.userId);
            const academicYear = Number(query.academicYear);
    
            let data = await StudentsAdmissionModel.aggregate([
                {
                    $match: {
                        groupId: Number(groupId),
                        userId: userId
                    },
                },
                {
                    $unwind: "$feesDetails",
                },
                {
                    $lookup: {
                        from: "feestemplates",
                        localField: "feesDetails.feesTemplateId",
                        foreignField: "feesTemplateId",
                        as: "feesDetails.feesTemplateId",
                    },
                },
                {
                    $unwind: "$feesDetails.feesTemplateId",
                },
                {
                    $group: {
                        _id: "$_id",
                        groupId: { $first: "$groupId" },
                        userId: { $first: "$userId" },
                        academicYear: { $first: "$academicYear" },
                        addmissionId: { $first: "$addmissionId" },
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
                        courseDetails: { $first: "$courseDetails" },
                        feesDetails: { $push: "$feesDetails" },
                        installmentId: { $first: "$installmentId" },
                        status: { $first: "$status" },
                    },
                },
                {
                    $lookup: {
                        from: "feespayments",
                        let: {
                            admissionId: "$addmissionId",
                            userId: "$userId",
                            academicYear: { $toString: "$academicYear" }, // Convert academicYear to string for comparison
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$addmissionId", "$$admissionId"] },
                                            { $eq: ["$userId", "$$userId"] },
                                            { $eq: [{ $toString: "$academicYear" }, "$$academicYear"] }, // Compare as string
                                        ],
                                    },
                                },
                            },
                            {
                                $sort: { createdAt: -1 },
                            },
                        ],
                        as: "feespayments",
                    },
                },
                {
                    $addFields: {
                        totalPaidAmount: {
                            $sum: {
                                $map: {
                                    input: "$feespayments",
                                    as: "payment",
                                    in: { $toDouble: "$$payment.paidAmount" },
                                },
                            },
                        },
                        lastRemainingAmount: {
                            $ifNull: [
                                {
                                    $arrayElemAt: ["$feespayments.remainingAmount", 0],
                                },
                                0,
                            ],
                        },
                    },
                },
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
    

    async findLatestAdmission() {
        try {
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

            let admissionData = await StudentsAdmissionModel.find({
                groupId: groupId,
                academicYear: academicYear,
                admissionStatus: "Confirm",
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
                        const courseId = courseDetail?.course_id;

                        const courseExists = courseData.find(
                            (course) => course.courseId === courseId
                        );

                        if (courseExists) {
                            const courseName = courseExists.CourseName;

                            if (!coursePayments[courseName].noOfStudents) {
                                coursePayments[courseName].noOfStudents = 0;
                            }
                            coursePayments[courseName].noOfStudents++;

                            if (!coursePayments[courseName].courseId) {
                                coursePayments[courseName].courseId = courseID;
                            }
                            if (!coursePayments[courseName].courseFee) {
                                coursePayments[courseName].courseFee =
                                    courseFee;
                            }
                        }
                    });
                }
            });
            let formattedCoursePayments = Object.keys(coursePayments).map(
                (courseName) => {
                    return {
                        name: courseName,
                        id: coursePayments[courseName].courseId,
                        count:
                            coursePayments[courseName].courseFee *
                            coursePayments[courseName].noOfStudents,
                        noOfStudents:
                            coursePayments[courseName].noOfStudents || 0,
                    };
                }
            );
            let response = {
                data: formattedCoursePayments,
            };

            return response;
        } catch (error) {
            console.error(error);
            throw new Error("Error getting admission listing");
        }
    }
    async getAdmissionListingForDonation(groupId, academicYear) {
        try {
            const pipeline = [
                {
                    $match: {
                        groupId: Number(groupId),
                    },
                },
                {
                    $lookup: {
                        from: "studentsadmissions",
                        localField: "courseId",
                        foreignField: "courseDetails.course_id",
                        as: "students",
                    },
                },

                {
                    $unwind: "$students",
                },
                {
                    $match: {
                        "students.academicYear": academicYear,
                        "students.admissionStatus": "Confirm",
                    },
                },
                {
                    $unwind: "$students.feesDetails",
                },
                {
                    $lookup: {
                        from: "feestemplates",
                        localField: "students.feesDetails.feesTemplateId",
                        foreignField: "feesTemplateId",
                        as: "feeTemplateData",
                    },
                },
                {
                    $match: {
                        "feeTemplateData.isShowInAccounting": false,
                    },
                },
                {
                    $group: {
                        _id: {
                            courseId: "$courseId",
                            courseName: "$CourseName",
                        },
                        studentCount: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        courseId: "$_id.courseId",
                        courseName: "$_id.courseName",
                        studentCount: 1,
                    },
                },
            ];

            const result = await courseModel.aggregate(pipeline);

            let formattedCoursePayments = result.map((course) => ({
                name: course.courseName,
                id: course.courseId,
                count: course.studentCount,
                noOfStudents: course.studentCount || 0,
            }));

            return { data: formattedCoursePayments };
        } catch (error) {
            console.error(error);
            throw new Error("Error getting admission listing");
        }
    }

    async getPendingInstallmentByAdmissionId(addmissionId) {
        try {
            const pipeline = [
                {
                    $match: {
                        addmissionId: addmissionId,
                    },
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

            const result = await studentAdmissionModel.aggregate(pipeline);

            console.log("Result:", result); // Log the result

            return result;
        } catch (error) {
            console.error("Error retrieving pending installment:", error);
            throw error;
        }
    }
    async updateInstallmentAmount(installmentId, newAmount, newStatus) {
        try {
            const updateResult = await studentAdmissionModel.findOneAndUpdate(
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
                await studentAdmissionModel.findOneAndUpdate(
                    { "feesDetails.feesDetailsId": feesDetail.feesDetailsId },
                    { $set: { "feesDetails.$.status": "paid" } }
                );
            } else {
                await studentAdmissionModel.findOneAndUpdate(
                    { "feesDetails.feesDetailsId": feesDetail.feesDetailsId },
                    { $set: { "feesDetails.$.status": "pending" } }
                );
            }
        } catch (error) {
            console.error("Error updating installment amount:", error);
        }
    }

    async bulkUpload(dataRows, userId) {
        try {
            let results = [];

            for (let i = 0; i < dataRows?.length; i++) {
                const data = dataRows[i];
                const CourseName = data.courseName;
                const className = data.class;
                const divisionName = data.division;
                const departmentName = data.department
                const groupId = data.groupId;

                const { courseId, classId, divisionId, departmentId } =
                    await this.getIdsByCourseName(
                        groupId,
                        departmentName,
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

                const existingPhoneNumberRecord =
                    await studentAdmissionModel.findOne({
                        $or: [{ phoneNumber: phoneNumber }],
                    });

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
                            phone: phoneNumber,
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
                            subscribe_on_whatsapp:
                                data.securitySettings_subscribe_on_whatsapp,
                            public_profile_url:
                                data.securitySettings_public_profile_url,
                        },
                    ],
                    courseDetails: [
                        {
                            departmentId: departmentId,
                            course_id: courseId,
                            class_id: classId,
                            division_id: divisionId,
                            subjects: data.subjects//.split(",") || [],
                        },
                    ],
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

    async getIdsByCourseName(groupId, departmentName, CourseName, className, divisionName) {
        try {

            const department = await DepartmentModel.findOne({
                groupId: groupId,
                departmentName: departmentName
            })

            const departmentId = department ? department.departmentId : null

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
                departmentId: departmentId,
                divisionId: divisionId,
            };
        } catch (error) {
            throw error;
        }
    }

    async getReligionId(religion, groupId) {
        religion = religion;
        groupId = groupId;
        let religionName = await religionModel.findOne({
            religion: { $regex: new RegExp(religion, "i") },
            groupId: groupId,
        });

        const religionId = religionName ? religionName.religionId : null;
        return {
            religionId,
        };
    }
    async getCategoryId(name, groupId) {
        name = name;
        groupId = groupId;
        let casteName = await CategoriesModel.findOne({
            name: { $regex: new RegExp(name, "i") },
            groupId: groupId,
        });

        const categoriseId = casteName ? casteName.categoriseId : null;
        return {
            categoriseId,
        };
    }
    async getAcademicYear(year, groupId) {
        year = year;
        groupId = groupId;
        let academicYearName = await AcademicYearModel.findOne({
            year: { $regex: new RegExp(year, "i") },
            groupId: groupId,
        });

        const academicYearId = academicYearName ? academicYearName.academicYearId : null;
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
            criteria.pageSize = 10;
            if (criteria.search) {
                const numericSearch = parseInt(criteria.search);
                if (!isNaN(numericSearch)) {
                    searchFilter.$or = [{ phoneNumber: numericSearch }];
                } else {
                    searchFilter.$or = [
                        {
                            firstName: {
                                $regex: criteria.search,
                                $options: "i",
                            },
                        },
                        {
                            lastName: {
                                $regex: criteria.search,
                                $options: "i",
                            },
                        },
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
            const students = await StudentsAdmissionModel.find(searchFilter)
                .skip(skip)
                .limit(limit)
                .exec();

            if (students) {
                let data = students.forEach((item) => {
                    let courseIds = item.courseDetails.forEach((element) => {
                        course_id = element.course_id;
                        class_id = element.class_id;
                        division_id = element.division_id;
                    });
                    let templateIds = item.feesDetails.forEach((element) => {
                        feesTemplateId = element.feesTemplateId;
                    });
                });

                const addmissionIds = students[0].addmissionId;
                const installmentData = students[0].feesDetails[0].installment;
                let courseDetails = await courseModel.findOne(
                    {
                        groupId: groupId,
                        courseId: course_id,
                    },
                    { courseName: 1, fees: 1, _id: 0 }
                );

                let classDetails = await ClassModel.findOne(
                    {
                        groupId: groupId,
                        classId: class_id,
                    },
                    { name: 1, _id: 0 }
                );

                let divisionDetails = await DivisionModel.findOne(
                    {
                        groupId: groupId,
                        divisionId: division_id,
                    },
                    { Name: 1, _id: 0 }
                );

                let feesPaymentDetails = await feesPaymentModel
                    .findOne(
                        {
                            groupId: groupId,
                            addmissionId: addmissionIds,
                        },
                        {
                            status: 1,
                            paidAmount: 1,
                            courseFee: 1,
                            remainingAmount: 1,
                            feesPaymentId: 1,
                            _id: 0,
                        }
                    )
                    .sort({ createdAt: -1 });

                const studantData = {
                    candidateName: `${students[0].firstName} ${students[0].middleName} ${students[0].lastName}`,
                    phoneNumber: students[0].phoneNumber,
                    addmissionId: addmissionIds,
                    empId: students[0].empId,
                    groupId: students[0].groupId,
                    installmentId: students[0].installmentId,
                    installments: installmentData,
                    courseName: courseDetails.courseName,
                    className: classDetails.name,
                    divisionName: divisionDetails.Name,
                    courseFees: feesPaymentDetails.courseFee,
                    status: feesPaymentDetails.status,
                    feesPaymentId: feesPaymentDetails.feesPaymentId,
                    paidAmount: feesPaymentDetails.paidAmount,
                    remainingAmount: feesPaymentDetails.remainingAmount,
                };

                const count = await StudentsAdmissionModel.countDocuments(
                    searchFilter
                );
                let response = {
                    servicesWithData: [studantData],
                    totalCount: count,
                };
                return response;
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async assignExaminationNo(groupId, criteria, newData) {
        const groupIdNum = Number(groupId);
        const classIdNum = Number(criteria.classId);
        const divisionIdNum = Number(criteria.divisionId);
        let startingExamNo = newData.startingExamNo;
        let sortCriteria = newData.orderBy || "admissionStatus";
        const findQuery = {
            groupId: groupIdNum,
            courseDetails: {
                $elemMatch: {
                    class_id: { $eq: classIdNum },
                    division_id: { $eq: divisionIdNum },
                },
            },
            admissionStatus: "Confirm",
        };

        try {
            const exs = [
                { $match: { ...findQuery, examRollNumber: startingExamNo } },
                { $sort: { [sortCriteria]: sortCriteria === "name" ? 1 : -1 } },
            ];
            const sortedDocs = await StudentsAdmissionModel.aggregate(
                exs
            ).exec();
            if (sortedDocs.length > 0) {
                return {
                    message: `Starting exam number  ${startingExamNo}  is already assigned for this criteria. Please choose a different starting number.`,
                };
            }
            const pipeline = [
                { $match: findQuery },
                { $sort: { [sortCriteria]: sortCriteria === "name" ? 1 : -1 } }, // Sort by name ascending, admissionStatus descending
                { $project: { _id: 1 } },
            ];
            const filteredDocuments = await StudentsAdmissionModel.aggregate(
                pipeline
            ).exec();
            if (filteredDocuments.length === 0) {
                return { message: "No documents found to update." };
            }
            const bulkOps = filteredDocuments.map((doc, index) => ({
                updateOne: {
                    filter: { _id: doc._id },
                    update: { $set: { examRollNumber: startingExamNo + index } },
                },
            }));
            const result = await StudentsAdmissionModel.bulkWrite(bulkOps);

            return {
                message: "Examination numbers assigned successfully.",
                result,
            };
        } catch (error) {
            console.error("Error during aggregation and update:", error);
            throw error;
        }
    }
}
module.exports = new StudentsAdmmisionService(
    studentAdmissionModel,
    "studentAdmission"
);
