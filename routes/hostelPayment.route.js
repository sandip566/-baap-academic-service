const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/hostelPayment.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/hostelPayment.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const hostelPaymentId = Date.now();
        req.body.hostelPaymentId = hostelPaymentId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all", async (req, res) => {
    const pagination = {
        pageNumber: req.query.pageNumber || 1,
        pageSize: 10,
    };
    const { pageNumber, pageSize, ...query } = req.query;
    const serviceResponse = await service.getAllByCriteria({
        req,
        query,
        pagination,
    });
    requestResponsehelper.sendResponse(res, serviceResponse);
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

router.get("/getAllupdateHostelPayment/groupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        hostelPaymentId: req.query.hostelPaymentId,
        studentId: req.query.studentId,
        mmemberId: req.query.memberId,
        hostelId: req.query.hostelId,
        pageNumber: parseInt(req.query.pageNumber) || 1,
    };
    const serviceResponse = await service.getAllHostelPaymentByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete(
    "/groupId/:groupId/hostelPaymentId/:hostelPaymentId",
    async (req, res) => {
        try {
            const hostelPaymentId = req.params.hostelPaymentId;
            const groupId = req.params.groupId;
            const deleteHostelPaymnet = await service.deleteHostelPaymentId({
                hostelPaymentId: hostelPaymentId,
                groupId: groupId,
            });
            if (!deleteHostelPaymnet) {
                res.status(404).json({
                    error: "HostelPaymnet data not found to delete",
                });
            } else {
                res.status(201).json(deleteHostelPaymnet);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.put(
    "/groupId/:groupId/hostelPaymentId/:hostelPaymentId",
    async (req, res) => {
        try {
            const hostelPaymentId = req.params.hostelPaymentId;
            const groupId = req.params.groupId;
            const newData = req.body;
            const updateHostelPaymnet = await service.updateHostelPaymentById(
                hostelPaymentId,
                groupId,
                newData
            );
            if (!updateHostelPaymnet) {
                res.status(404).json({
                    error: "HostelPaymnet data not found to update",
                });
            } else {
                res.status(200).json(updateHostelPaymnet);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);
module.exports = router;
