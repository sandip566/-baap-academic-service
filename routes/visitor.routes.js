const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/visitor.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const VisitorModel = require("../schema/visitor.schema")

router.post(
    "/",
    checkSchema(require("../dto/visitor.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const visitorId = +Date.now();
        req.body.visitorId = visitorId;
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

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        visitorId: req.query.visitorId,
        visitorName: req.query.visitorName,
    };
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/groupId/:groupId/visitorId/:visitorId", async (req, res) => {
    try {
        const visitorId = req.params.visitorId;
        const groupId = req.params.groupId;
        const Data = await service.deleteVendorById({
            visitorId: visitorId,
            groupId: groupId,
        });
        if (!Data) {
            res.status(404).json({ error: "visito data not found to delete" });
        } else {
            res.status(201).json(Data);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/groupId/:groupId/visitorId/:visitorId", async (req, res) => {
    try {
        const visitorId = req.params.visitorId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const updateData = await service.updateVisitorById(
            visitorId,
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
        const visitorId = req.body.visitor;

        if (!Array.isArray(visitorId) || visitorId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty visitorId array",
            });
        }

        const numericIds = visitorId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${visitorId}`);
            }
            return num;
        });

        const result = await VisitorModel.deleteMany({
            groupId: groupId,
            visitorId: { $in: numericIds },
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
