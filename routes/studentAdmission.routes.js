const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/studentAdmission.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const { default: mongoose } = require("mongoose");
const feesInstallmentServices = require("../services/feesInstallment.services");
const documentConfigurationService = require("../services/documentConfiguration.services");
const TokenService = require("../services/token.services");
const multer = require("multer");
const DocumentConfiguration = require("../schema/documentConfiguration.schema");
const upload = multer();
const xlsx = require("xlsx");
const { isDate } = require("moment");
const Student = require("../schema/studentAdmission.schema");
router.post(
    "/",
    checkSchema(require("../dto/studentAdmission.dto")),
    async (req, res, next) => {
        try {
            if (ValidationHelper.requestValidationErrors(req, res)) {
                return;
            }
            const studentAdmissionId = +Date.now();
            req.body.studentAdmissionId = studentAdmissionId;
            const serviceResponse = await service.create(req.body);
            requestResponsehelper.sendResponse(res, serviceResponse);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.get("/getByAddmissionId/:addmissionId", async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }
    const serviceResponse = await service.getByAddmissionId(
        req.params.addmissionId
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.get("/all", async (req, res) => {
    try {
        const serviceResponse = await service.getAllByCriteria({});
        requestResponsehelper.sendResponse(res, serviceResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/data/save", async (req, res, next) => {
    try {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }

        if (req.body.addmissionId) {
            const existingDocument = await service.getByAddmissionIdData(
                req.body.addmissionId
            );
            if (existingDocument.data !== null) {
                //                 if (req.body.documents && req.body.documents.length > 0) {
                //                     for (const documentData of req.body.documents) {
                //                         const updatedDocument = {
                //                             documentTitle: documentData.documentTitle || "",
                //                             expiryDate: documentData.expiryDate || "",
                //                             formDate: documentData.formDate|| "",
                //                             documentUrl: documentData.documentUrl || "",
                //                             groupId: req.body.groupId ,
                //                             userId: req.body.userId
                //                         };
                // console.log(updatedDocument);
                //                         const documentUpdateResponse = await documentConfigurationService.updateUser(
                //                             req.body.groupId,
                //                             req.body.addmissionId,
                //                             updatedDocument
                //                         );
                //                         console.log(documentUpdateResponse);
                //                     }
                //                 }
                if (req.body.documents && req.body.documents.length > 0) {
                    for (const documentData of req.body.documents) {
                        const documentId =
                            Date.now() + Math.floor(Math.random() * 1000);
                        const document = new DocumentConfiguration({
                            documentTitle: documentData.documentTitle || "",
                            expiryDate: documentData.expiryDate || "",
                            formDate: documentData.formDate || "",
                            documentUrl: documentData.documentUrl || "",
                            documentId: documentId,
                            groupId: req.body.groupId,
                            userId: req.body.userId,
                            addmissionId: req.body.addmissionId,
                            empId: req.body.empId,
                            roleId: req.body.roleId,
                        });
                        console.log(document);
                        await document.save();
                    }
                }
                if (req.body.feesDetails) {
                    const installmentId = +Date.now();
                    req.body.installmentId = installmentId;

                    const updatedFeesDetails = req.body.feesDetails.map(
                        (feesDetail) => {
                            const installNo =
                                +Date.now() +
                                Math.floor(Math.random() * 1000) +
                                1;

                            const updatedInstallments =
                                feesDetail.installment.map((installment) => {
                                    const uniqueInstallNo =
                                        +Date.now() +
                                        Math.floor(Math.random() * 1000) +
                                        1;
                                    return {
                                        ...installment,
                                        installmentNo: uniqueInstallNo,
                                        status: "pending",
                                    };
                                });

                            return {
                                ...feesDetail,
                                feesDetailsId: installNo,
                                installment: updatedInstallments,
                            };
                        }
                    );

                    req.body.feesDetails = updatedFeesDetails;

                    const feesinstallmentResponse =
                        await feesInstallmentServices.updateUser(
                            req.body.addmissionId,
                            req.body.groupId,
                            req.body
                        );

                    console.log(feesinstallmentResponse);
                }

                const serviceResponse = await service.updateUser(
                    req.body.addmissionId,
                    req.body
                );

                requestResponsehelper.sendResponse(res, serviceResponse);
            } else {
                const serviceResponse = await service.create(req.body);
                if (req.body.documents && req.body.documents.length > 0) {
                    for (const documentData of req.body.documents) {
                        const documentId =
                            Date.now() + Math.floor(Math.random() * 1000);
                        const document = new DocumentConfiguration({
                            documentTitle: documentData.documentTitle || "",
                            expiryDate: documentData.expiryDate || "",
                            formDate: documentData.formDate || "",
                            documentUrl: documentData.documentUrl || "",
                            documentId: documentId,
                            groupId: req.body.groupId,
                            userId: req.body.userId,
                            addmissionId: req.body.addmissionId,
                            empId: req.body.empId,
                            roleId: req.body.roleId,
                        });
                        console.log(document);
                        await document.save();
                    }
                }

                if (req.body.feesDetails) {
                    const installmentId = +Date.now();
                    req.body.installmentId = installmentId;

                    const feesinstallment =
                        await feesInstallmentServices.create(req.body);

                    const updatedInstallments = req.body.feesDetails.map(
                        (detail, index) => ({
                            ...detail,
                            installNo: index + 1,
                        })
                    );

                    req.body.feesDetails = updatedInstallments;
                }

                requestResponsehelper.sendResponse(res, serviceResponse);
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.delete(
    "/installmentDetails/addmissionId/:addmissionId/installmentId/:installmentId",

    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const serviceResponse = await service.deleteCompanyDetails(
            req.params.addmissionId,
            req.params.installmentId
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.delete("/:id", async (req, res) => {
    try {
        const serviceResponse = await service.deleteById(req.params.id);
        requestResponsehelper.sendResponse(res, serviceResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const serviceResponse = await service.updateById(
            req.params.id,
            req.body
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const serviceResponse = await service.getById(req.params.id);
        requestResponsehelper.sendResponse(res, serviceResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.post("/bulkupload", upload.single("excelFile"), async (req, res) => {
    try {
        let dataRows = req.body.dataRows;

        const result = await service.bulkUpload(dataRows);

        if (!result) {
            throw new Error(`Smart ID already exists`);
        }

        res.json({
            success: true,
            message: "Bulk upload successful",
            data: result,
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.get(
    "/all/getByGroupId/:groupId",
    TokenService.checkPermission(["EAC1"]),
    async (req, res) => {
        try {
            const groupId = req.params.groupId;
            const page = parseInt(req.query.page) || 1;
            const perPage = parseInt(req.query.limit);
            const criteria = {
                // phoneNumber: req.query.phoneNumber,
                academicYear: req.query.academicYear,
                firstName: req.query.firstName,
                phoneNumber: req.query.phoneNumber,
                lastName: req.query.lastName,
                admissionStatus: req.query.admissionStatus,
                status: req.query.status,
                roleId: req.query.roleId,
                search: req.query.search,
                CourseName: req.query.CourseName,
                className: req.query.className,
            };

            const serviceResponse = await service.getAllDataByGroupId(
                groupId,
                criteria,
                page,
                perPage
            );

            requestResponsehelper.sendResponse(res, serviceResponse);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);
router.get(
    "/all/getDonationDataByGroupId/:groupId",
    TokenService.checkPermission(["EAC1"]),
    async (req, res) => {
        try {
            const groupId = req.params.groupId;
            const page = parseInt(req.query.page) || 1;
            const perPage = parseInt(req.query.limit);
            const criteria = {
                // phoneNumber: req.query.phoneNumber,
                academicYear: req.query.academicYear,
                firstName: req.query.firstName,
                phoneNumber: req.query.phoneNumber,
                lastName: req.query.lastName,
                admissionStatus: req.query.admissionStatus,
                status: req.query.status,
                search: req.query.search,
                CourseName: req.query.CourseName,
                className: req.query.className,
            };

            const serviceResponse = await service.getDonationDataByGroupId(
                groupId,
                criteria,
                page,
                perPage
            );

            requestResponsehelper.sendResponse(res, serviceResponse);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);
router.get("/all/confirmAdmission/:groupId", async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.limit);
        const criteria = {
            firstName: req.query.firstName,
            phoneNumber: req.query.phoneNumber,
            lastName: req.query.lastName,
            className: req.query.className,
        };
        const serviceResponse = await service.getAllByGroupId(
            groupId,
            criteria,
            page,
            perPage
        );

        requestResponsehelper.sendResponse(res, serviceResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/all/getfeesPayment/:groupId", async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const criteria = {
            // phoneNumber: req.query.phoneNumber,
            firstName: req.query.firstName,
            phoneNumber: req.query.phoneNumber,
            lastName: req.query.lastName,
            search: req.query.search,
            addmissionId: req.query.addmissionId,
            academicYear: req.query.academicYear,
            empId: req.query.empId,
        };

        const serviceResponse = await service.getfeesPayment(groupId, criteria);
        requestResponsehelper.sendResponse(res, serviceResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get(
    "/all/getAdmissionListing/groupId/:groupId/academicYear/:academicYear",
    async (req, res) => {
        try {
            const groupId = req.params.groupId;
            const academicYear = req.params.academicYear;

            const courseData = await service.getAdmissionListing(
                groupId,
                academicYear
            );
            res.json(courseData);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);
router.get(
    "/all/getDonationAdmissionListing/groupId/:groupId/academicYear/:academicYear",
    async (req, res) => {
        try {
            const groupId = req.params.groupId;
            const academicYear = req.params.academicYear;

            const courseData = await service.getAdmissionListingForDonation(
                groupId,
                academicYear
            );
            res.json(courseData);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);
router.delete(
    "/groupId/:groupId/studentAdmissionId/:addmissionId",
    TokenService.checkPermission(["EAC4"]),
    async (req, res) => {
        try {
            const addmissionId = req.params.addmissionId;
            const groupId = req.params.groupId;
            const Data = await service.deleteByStudentsAddmisionId(
                addmissionId,
                groupId
            );
            if (!Data) {
                res.status(404).json({ error: "data not found to delete" });
            } else {
                res.status(201).json(Data);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.put(
    "/groupId/:groupId/studentAdmissionId/:addmissionId",
    TokenService.checkPermission(["EAC3"]),
    async (req, res) => {
        try {
            const addmissionId = req.params.addmissionId;
            const groupId = req.params.groupId;
            const newData = req.body;
            const updatedData = await service.updateStudentsAddmisionById(
                addmissionId,
                groupId,
                newData
            );
            if (!updatedData) {
                res.status(404).json({ error: " not found to update" });
            } else {
                res.status(201).json(updatedData);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.get("/autocomplete/students", async (req, res) => {
    const firstName = req.query.firstName;
    try {
        const students = await Student.find({
            firstName: { $regex: firstName, $options: "i" },
        }).limit(10);
        const suggestedNames = students.map((student) => student.name);
        res.json({ data: students });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/all/getByGroupId/searching/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        search: req.query.search,
    };
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const result = await service.getAllSearchDataByGroupId(
        groupId,
        criteria,
        skip,
        limit
    );
    requestResponsehelper.sendResponse(res, result);
});

router.put("/groupId/:groupId/userId/:userId", async (req, res) => {
    try {
        const groupId = parseInt(req.params.groupId);
        const userId = parseInt(req.params.userId);
        const newData = req.body;
        const updatedData = await service.updateByUserId(
            groupId,
            userId,
            newData
        );
        if (!updatedData) {
            res.status(404).json({ error: " not found to update" });
        } else {
            res.status(201).json(updatedData);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
module.exports = router;
