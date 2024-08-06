const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/transactions.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const TransactionModel = require("../schema/transactions.schema")

router.post(
    "/",
    checkSchema(require("../dto/transactions.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const transactionId = +Date.now();
        req.body.transactionId = transactionId;
        const items = req.body.items;
        const totalAmount = items.reduce(
            (acc, item) => acc + item.quantity * item.unitPrice,
            0
        );
        req.body.totalAmount = totalAmount;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});
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

router.delete(
    "/groupId/:groupId/transactionId/:transactionId",
    async (req, res) => {
        try {
            const transactionId = req.params.transactionId;
            const groupId = req.params.groupId;
            const transactionData = await service.deleteByTransactionId({
                transactionId: transactionId,
                groupId: groupId,
            });
            if (!transactionData) {
                res.status(404).json({
                    error: "transaction data not found to delete",
                });
            } else {
                res.status(201).json(transactionData);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.put(
    "/groupId/:groupId/transactionId/:transactionId",
    async (req, res) => {
        try {
            const transactionId = req.params.transactionId;
            const groupId = req.params.groupId;
            const newData = req.body;
            const updatedData = await service.updateTransactionById(
                transactionId,
                groupId,
                newData
            );
            if (!updatedData) {
                res.status(404).json({
                    error: "Transaction not found to update",
                });
            } else {
                res.status(201).json(updatedData);
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
        vendorId: req.query.vendorId,
        transactionId: req.query.transactionId,
    };
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const transactionId = req.body.transaction;

        if (!Array.isArray(transactionId) || transactionId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty transactionId array",
            });
        }

        const numericIds = transactionId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${transactionId}`);
            }
            return num;
        });

        const result = await TransactionModel.deleteMany({
            groupId: groupId,
            transactionId: { $in: numericIds },
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
