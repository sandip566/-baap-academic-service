const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/miscellaneousPayment.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const miscellaneousPaymentModel = require("../schema/miscellaneousPayment.schema")

router.post(
    "/",
    checkSchema(require("../dto/miscellaneousPayment.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const miscellaneousPaymentId = Date.now();
        req.body.miscellaneousPaymentId = miscellaneousPaymentId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all", async (req, res) => {
    const pagination = {
        pageNumber: req.query.pageNumber || 1,
        pageSize: 10
    };
    const { pageNumber, pageSize, ...query } = req.query;
    const serviceResponse = await service.getAllByCriteria({ req, query, pagination });
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

router.get("/getAllmiscellaneousPayment/groupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        miscellaneousPaymentId: req.query.miscellaneousPaymentId,
        studentId: req.query.studentId,
        empId: req.query.empId,
        installmentId: req.query.installmentId,
        pageNumber: parseInt(req.query.pageNumber) || 1
    };
    const serviceResponse = await service.getAllMiscellaneousPaymentByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete(
    "/groupId/:groupId/miscellaneousPaymentId/:miscellaneousPaymentId",
    async (req, res) => {
        try {
            const miscellaneousPaymentId = req.params.miscellaneousPaymentId;
            const groupId = req.params.groupId;
            const deleteMiscellaneousPayment =
                await service.deleteMiscellaneousPaymentById({
                    miscellaneousPaymentId: miscellaneousPaymentId,
                    groupId: groupId,
                });
            if (!deleteMiscellaneousPayment) {
                res.status(404).json({
                    error: "deleteMiscellaneousPayment data not found to delete",
                });
            } else {
                res.status(201).json(deleteMiscellaneousPayment);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.put(
    "/groupId/:groupId/miscellaneousPaymentId/:miscellaneousPaymentId",
    async (req, res) => {
        try {
            const miscellaneousPaymentId = req.params.miscellaneousPaymentId;
            const groupId = req.params.groupId;
            const newData = req.body;
            const updateMiscellaneousPayment =
                await service.updateMiscellaneousPaymentById(
                    miscellaneousPaymentId,
                    groupId,
                    newData
                );
            if (!updateMiscellaneousPayment) {
                res.status(404).json({
                    error: "updateMiscellaneousPayment data not found to update",
                });
            } else {
                res.status(200).json(updateMiscellaneousPayment);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const miscellaneousPaymentId = req.body.miscellaneousPayment;

        if (!Array.isArray(miscellaneousPaymentId) || miscellaneousPaymentId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty miscellaneousPaymentId array",
            });
        }

        const numericIds = miscellaneousPaymentId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${miscellaneousPaymentId}`);
            }
            return num;
        });

        const result = await miscellaneousPaymentModel.deleteMany({
            groupId: groupId,
            miscellaneousPaymentId: { $in: numericIds },
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
