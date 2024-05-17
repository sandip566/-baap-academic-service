const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/hosteladmission.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const TokenService = require("../services/token.services");

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
router.post("/data/save", async (req, res, next) => {
    try {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }

        if (req.body.hostelAdmissionId) {
            const existingDocument = await service.getByAddmissionIdData(
                req.body.hostelAdmissionId
            );
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
                                feesDetailsId: installNo,
                                installment: updatedInstallments,
                            };
                        }
                    );

                    req.body.feesDetails = updatedFeesDetails;

                    const feesinstallmentResponse =
                        await hostelFeesInstallmentServices.updateUser(
                            req.body.hostelAdmissionId,
                            req.body.groupId,
                            req.body
                        );

                    console.log(feesinstallmentResponse);
                }

                const serviceResponse = await service.updateUser(
                    req.body.hostelAdmissionId,
                    req.body
                );

                requestResponsehelper.sendResponse(res, serviceResponse);
            } else {
                const serviceResponse = await service.create(req.body);

                if (req.body.feesDetails) {
                    const hostelInstallmentId = +Date.now();
                    req.body.hostelInstallmentId = hostelInstallmentId;

                    const feesinstallment =
                        await hostelFeesInstallmentServices.create(req.body);

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
router.delete("/:id", async (req, res) => {
    const serviceResponse = await service.deleteById(req.params.id);

    requestResponsehelper.sendResponse(res, serviceResponse);
});

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
    TokenService.checkPermission(["EMA1"]),
    async (req, res) => {
        const groupId = req.params.groupId;
        const criteria = {
            name: req.query.name,
        };
        const serviceResponse = await service.getAllDataByGroupId(
            groupId,
            criteria
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
router.delete(
    "/groupId/:groupId/hostelAdmissionId/:hostelAdmissionId",
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
router.get("/gethostelAdmissionId/:hostelAdmissionId", async (req, res) => {
    const serviceResponse = await service.getByHostelId(
        req.params.hostelAdmissionId
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});
module.exports = router;
