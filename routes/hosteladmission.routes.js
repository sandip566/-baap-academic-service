const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/hosteladmission.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const TokenService = require("../services/token.services");
const hostelfeesinstallmentService = require("../services/hostelfeesinstallment.service");
const bedroomModel=require("../schema/bedrooms.schema")

router.post(
    "/",
    checkSchema(require("../dto/hosteladmission.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const hostelAdmissionId = +Date.now();
        req.body.hostelAdmissionId = hostelAdmissionId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
router.post("/hostelAdmission/save", async (req, res, next) => {
    try {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }

        if (req.body.hostelAdmissionId) {
            const existingDocument = await service.getByAddmissionIdData(
                req.body.hostelAdmissionId
            );
            console.log(existingDocument);
            console.log("existingDocument", existingDocument.data !== null);
            if (existingDocument.data !== null) {
                if (req.body.feesDetails) {
                    const hostelInstallmentId = +Date.now();
                    req.body.hostelInstallmentId = hostelInstallmentId;

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
                                hostelFeesDetailsId: installNo,
                                installment: updatedInstallments,
                            };
                        }
                    );

                    req.body.feesDetails = updatedFeesDetails;

                    const feesinstallmentResponse =
                        await hostelfeesinstallmentService.updateUser(
                            req.body.hostelAdmissionId,
                            req.body.groupId,
                            req.body
                        );

                    console.log(feesinstallmentResponse);
                }
                if (req.body.hostelDetails) {
                    for (const detail of req.body.hostelDetails) {
                        const { hostelId, roomId, bedId } = detail;
            
                        const bedRoom = await bedroomModel.findOne({
                            hostelId: hostelId,
                            roomId: roomId,
                            'beds.bedId': bedId
                        });
            
                        if (bedRoom) {
                            const bedIndex = bedRoom.beds.findIndex(bed => bed.bedId === bedId);
                            if (bedIndex !== -1) {
                                bedRoom.beds[bedIndex].status = 'reserved';
                                await bedRoom.save();
                            }
                        }
                    }
                }
                const serviceResponse = await service.updateUser(
                    req.body.hostelAdmissionId,
                    req.body.groupId,
                    req.body
                );

                requestResponsehelper.sendResponse(res, serviceResponse);
            } else {
                const serviceResponse = await service.create(req.body);

                if (req.body.feesDetails) {
                    const hostelInstallmentId = +Date.now();
                    req.body.hostelInstallmentId = hostelInstallmentId;

                    const feesinstallment =
                        await hostelfeesinstallmentService.create(req.body);

                    const updatedInstallments = req.body.feesDetails.map(
                        (detail, index) => ({
                            ...detail,
                            installNo: index + 1,
                        })
                    );

                    req.body.feesDetails = updatedInstallments;
                }
                if (req.body.hostelDetails) {
                    for (const detail of req.body.hostelDetails) {
                        const { hostelId, roomId, bedId } = detail;
            
                        const bedRoom = await bedroomModel.findOne({
                            hostelId: hostelId,
                            roomId: roomId,
                            'beds.bedId': bedId
                        });
            
                        if (bedRoom) {
                            const bedIndex = bedRoom.beds.findIndex(bed => bed.bedId === bedId);
                            if (bedIndex !== -1) {
                                bedRoom.beds[bedIndex].status = 'reserved';
                                await bedRoom.save();
                            }
                        }
                    }
                }
                requestResponsehelper.sendResponse(res, serviceResponse);
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.delete("/:id", async (req, res) => {
    const serviceResponse = await service.deleteById(req.params.id);

    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.delete(
    "/groupId/:groupId/hostelAdmissionId/:hostelAdmissionId",
    TokenService.checkPermission(["EAC4"]),
    async (req, res) => {
        try {
            const hostelAdmissionId = req.params.hostelAdmissionId;
            const groupId = req.params.groupId;
            const Data = await service.deleteByStudentsAddmisionId(
                hostelAdmissionId,
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

router.put("/:id", async (req, res) => {
    const serviceResponse = await service.updateById(req.params.id, req.body);

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/:id", async (req, res) => {
    const serviceResponse = await service.getById(req.params.id);

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/all/hostelAdmission", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});

    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.get(
    "/all/getByGroupId/:groupId",
    // TokenService.checkPermission(["EAC1"]),
    async (req, res) => {
        try {
            const groupId = req.params.groupId;
            const page = parseInt(req.query.page) || 1;
            const perPage = parseInt(req.query.limit) || 10;
            const criteria = {
                academicYear: req.query.academicYear,
                firstName: req.query.firstName,
                phoneNumber: req.query.phoneNumber,
                lastName: req.query.lastName,
                admissionStatus: req.query.admissionStatus,
                status: req.query.status,
                roleId: req.query.roleId,
                search: req.query.search,
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
    "/getTotalHostelCount/:groupId",
    TokenService.checkPermission(["EAC1"]),
    async (req, res) => {
        try {
            const groupId = req.params.groupId;
            const criteria = {
                academicYear: req.query.academicYear,
                admissionStatus: req.query.admissionStatus,
                status: req.query.status,
            };

            const serviceResponse = await service.getTotalCount(
                groupId,
                criteria
            );

            requestResponsehelper.sendResponse(res, serviceResponse);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);
router.delete(
    "/deleteData/groupId/:groupId/hostelAdmissionId/:hostelAdmissionId",
    TokenService.checkPermission(["EMA4"]),
    async (req, res) => {
        try {
            const groupId = req.params.groupId;
            const hostelAdmissionId = req.params.hostelAdmissionId;
            const Data = await service.deleteByDataId(
                groupId,
                hostelAdmissionId
            );
            if (!Data) {
                res.status(404).json({ warning: "Data not found to delete" });
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
    "/groupId/:groupId/hostelAdmissionId/:hostelAdmissionId",
    TokenService.checkPermission(["EMA3"]),
    async (req, res) => {
        try {
            const hostelAdmissionId = req.params.hostelAdmissionId;
            const groupId = req.params.groupId;
            const newData = req.body;
            const Data = await service.updateDataById(
                hostelAdmissionId,
                groupId,
                newData
            );
            if (!Data) {
                res.status(404).json({ warning: "Data not found to update" });
            } else {
                res.status(201).json(Data);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);
router.get("/all/getfeesPayment/:groupId", async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const criteria = {
            // phoneNumber: req.query.phoneNumber,
            firstName: req.query.firstName,
            phoneNumber: req.query.phoneNumber,
            lastName: req.query.lastName,
            search: req.query.search,
            hostelAdmissionId: req.query.hostelAdmissionId,
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
    "/HostelAdmissionListing/groupId/:groupId",
    async (req, res) => {
        try {
            const groupId = req.params.groupId;
            // const academicYear = req.params.academicYear;

            const courseData = await service.getAdmissionListing(
                groupId,
                // academicYear
            );
            res.json(courseData);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);
router.get("/getFeesStructure/:groupId", async (req, res) => {
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
            userId: req.query.userId,
            empId: req.query.empId,
        };

        const serviceResponse = await service.getIndividualStudentData(groupId, criteria);
        requestResponsehelper.sendResponse(res, serviceResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get("/getByAddmissionId/:hostelAdmissionId", async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }
    const serviceResponse = await service.getByAddmissionId(
        req.params.hostelAdmissionId
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.get("/gethostelAdmissionId/:hostelAdmissionId", async (req, res) => {
    const serviceResponse = await service.getByHostelId(
        req.params.hostelAdmissionId
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});
module.exports = router;
