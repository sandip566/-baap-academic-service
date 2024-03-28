const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/feesTemplate.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const TokenService = require("../services/token.services");

router.post(
    "/",
    checkSchema(require("../dto/feesTemplate.dto")),
    TokenService.checkPermission(["EMT2"]),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const feesTemplateId = +Date.now();
        req.body.feesTemplateId = feesTemplateId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
router.get(
    "/getByFeesTemplateId/:feesTemplateId/installmentNo/:installmentNo",
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }

        const feesTemplateId = req.params.feesTemplateId;
        console.log(feesTemplateId);
        const installmentNo = parseInt(req.params.installmentNo);

        try {
            const installmentDetails = [];
            const serviceResponse = await service.getByfeesTemplateId(
                feesTemplateId
            );

            if (serviceResponse.data) {
                const totalFees = serviceResponse.data.totalFees;
                const installmentAmount = Math.round(totalFees / installmentNo);

                for (let i = 1; i <= installmentNo; i++) {
                    installmentDetails.push({
                        installmentNo: i,
                        amount: installmentAmount,
                        totalInstallmentAmount: installmentAmount,
                    });
                }
                serviceResponse.data.installmentDetails = installmentDetails;
            }
            let response = {
                status: "success",
                data: installmentDetails,
            };
            requestResponsehelper.sendResponse(res, response);
        } catch (error) {
            console.error("Error occurred:", error);
            requestResponsehelper.sendResponse(res, {
                status: "Failed",
                message: "An error occurred while processing the request.",
            });
        }
    }
);

router.get("/all", TokenService.checkPermission(["EMT1"]), async (req, res) => {
    const pagination = {
        pageNumber: req.query.pageNumber || 1,
        pageSize: req.query.pageNumber,
    };
    const { pageNumber, ...query } = req.query;
    const serviceResponse = await service.getAllByCriteria(query, pagination);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete(
    "/:id",
    TokenService.checkPermission(["EMT4"]),
    async (req, res) => {
        const serviceResponse = await service.deleteById(req.params.id);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.put("/:id", TokenService.checkPermission(["EMT3"]), async (req, res) => {
    const serviceResponse = await service.updateById(req.params.id, req.body);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/:id", TokenService.checkPermission(["EMT1"]), async (req, res) => {
    const serviceResponse = await service.getById(req.params.id);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get(
    "/all/getByGroupId/:groupId",
    TokenService.checkPermission(["EMT1"]),
    async (req, res) => {
        const groupId = req.params.groupId;
        const criteria = {
            feesTemplateId: req.query.feesTemplateId,
            pageNumber: parseInt(req.query.pageNumber) || 1,
        };
        const serviceResponse = await service.getAllDataByGroupId(
            groupId,
            criteria
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get(
    "/getDataByUsingLink/all/getByGroupId/:groupId",
    async (req, res) => {
        const groupId = req.params.groupId;
        const criteria = {
            feesTemplateId: req.query.feesTemplateId,
            pageNumber: parseInt(req.query.pageNumber) || 1,
        };
        const serviceResponse = await service.getAllDataByGroupId(
            groupId,
            criteria
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.delete(
    "/groupId/:groupId/feesTemplateId/:feesTemplateId",
    TokenService.checkPermission(["EMT4"]),
    async (req, res) => {
        try {
            const feesTemplateId = req.params.feesTemplateId;
            const groupId = req.params.groupId;
            const Data = await service.deletefeesTemplateById({
                feesTemplateId: feesTemplateId,
                groupId: groupId,
            });
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
    "/groupId/:groupId/feesTemplateId/:feesTemplateId",
    TokenService.checkPermission(["EMT3"]),
    async (req, res) => {
        try {
            const feesTemplateId = req.params.feesTemplateId;
            const groupId = req.params.groupId;
            const newData = req.body;
            const updateData = await service.updatefeesTemplateById(
                feesTemplateId,
                groupId,
                newData
            );
            if (!updateData) {
                res.status(404).json({ error: "data not found to update" });
            } else {
                res.status(200).json(updateData);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);
module.exports = router;
