const express = require("express");
const router = express.Router();
const { checkSchema, query } = require("express-validator");
const service = require("../services/vendor.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const vendorModel = require("../schema/vendor.schema")

router.post(
    "/",
    checkSchema(require("../dto/vendor.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const vendorId = +Date.now();
        req.body.vendorId = vendorId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all", async (req, res) => {
    const pagination = {
        pageNumber: parseInt(req.query.pageNumber) || 1,
        pageSize: 10,
    };
    const { pageNumber, pageSize, ...query } = req.query;
    const serviceResponse = await service.getAllByCriteria(query, pagination);
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

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        vendorId: req.query.vendorId,
        vendorName: req.query.vendorName,
        pageNumber: parseInt(req.query.pageNumber) || 1,
    };
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/groupId/:groupId/vendorId/:vendorId", async (req, res) => {
    try {
        const vendorId = req.params.vendorId;
        const groupId = req.params.groupId;
        const Data = await service.deleteVendorById({
            vendorId: vendorId,
            groupId: groupId,
        });
        if (!Data) {
            res.status(404).json({ error: "Vendor data not found to delete" });
        } else {
            res.status(201).json(Data);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/groupId/:groupId/vendorId/:vendorId", async (req, res) => {
    try {
        const vendorId = req.params.vendorId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const updateData = await service.updateVendorById(
            vendorId,
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
});

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const vendorId = req.body.vendor;

        if (!Array.isArray(vendorId) || vendorId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty vendorId array",
            });
        }

        const numericIds = vendorId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${vendorId}`);
            }
            return num;
        });

        const result = await vendorModel.deleteMany({
            groupId: groupId,
            vendorId: { $in: numericIds },
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
