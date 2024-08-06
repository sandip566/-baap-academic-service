const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/latefeepayment.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const LatefeepaymentModel = require("../schema/latefeepayment.schema");

router.post(
    "/",
    checkSchema(require("../dto/latefeepayment.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const lateFeePaymentId = +Date.now();
        req.body.lateFeePaymentId = lateFeePaymentId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete(
    "/groupId/:groupId/lateFeePaymentId/:lateFeePaymentId",
    async (req, res) => {
        try {
            const lateFeePaymentId = req.params.lateFeePaymentId;
            const groupId = req.params.groupId;
            const Data = await service.deleteByDataId(
                lateFeePaymentId,
                groupId
            );
            if (!Data) {
                res.status(404).json({ error: "Data not found to delete" });
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
    "/groupId/:groupId/lateFeePaymentId/:lateFeePaymentId",
    async (req, res) => {
        try {
            const lateFeePaymentId = req.params.lateFeePaymentId;
            const groupId = req.params.groupId;
            const newData = req.body;
            const Data = await service.updateDataById(
                lateFeePaymentId,
                groupId,
                newData
            );
            if (!Data) {
                res.status(404).json({ error: "Data not found to update" });
            } else {
                res.status(201).json(Data);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        lateFeeAmount: req.query.lateFeeAmount,
        paymentStatus: req.query.paymentStatus,
        lateFeePaymentId: req.query.lateFeePaymentId,
    };
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/lateFeePaymentId/:id", async (req, res) => {
    const serviceResponse = await service.getByDataId(req.params.id);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/:id", async (req, res) => {
    const serviceResponse = await service.getById(req.params.id);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.put("/:id", async (req, res) => {
    const serviceResponse = await service.updateById(req.params.id, req.body);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/:id", async (req, res) => {
    const serviceResponse = await service.deleteById(req.params.id);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const lateFeePaymentId = req.body.lateFeePayment;

        if (!Array.isArray(lateFeePaymentId) || lateFeePaymentId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty lateFeePaymentId array",
            });
        }

        const numericIds = lateFeePaymentId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${lateFeePaymentId}`);
            }
            return num;
        });

        const result = await LatefeepaymentModel.deleteMany({
            groupId: groupId,
            lateFeePaymentId: { $in: numericIds },
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "No records found to delete",
            });
        }

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} records deleted successfully`,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
