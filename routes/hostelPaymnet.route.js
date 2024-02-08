const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/hostelPayment.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/hostelPaymnet.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const hostelPaymnetId = Date.now();
        req.body.hostelPaymnetId = hostelPaymnetId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all", async (req, res) => {
    const pagination = {
        pageNumber: req.query.pageNumber || 1,
        pageSize: 10 
    };
    const serviceResponse = await service.getAllByCriteria({req,query,pagination});
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

router.get("/getAllupdateHostelPaymnet/groupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        hostelPaymnetId: req.query.hostelPaymnetId,
        studentId: req.query.studentId,
        mmemberId: req.query.memberId,
        hostelId: req.query.hostelId,
        pageNumber:parseInt(req.query.pageNumber) || 1
    };
    const serviceResponse = await service.getAllHostelPaymnetByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete(
    "/groupId/:groupId/hostelPaymnetId/:hostelPaymnetId",
    async (req, res) => {
        try {
            const hostelPaymnetId = req.params.hostelPaymnetId;
            const groupId = req.params.groupId;
            const deleteHostelPaymnet =
                await service.deleteHostelPaymnetById({
                    hostelPaymnetId: hostelPaymnetId,
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
    "/groupId/:groupId/hostelPaymnetId/:hostelPaymnetId",
    async (req, res) => {
        try {
            const hostelPaymnetId = req.params.hostelPaymnetId;
            const groupId = req.params.groupId;
            const newData = req.body;
            const updateHostelPaymnet =
                await service.updateHostelPaymnetById(
                    hostelPaymnetId,
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
