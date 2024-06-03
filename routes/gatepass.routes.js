const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/gatepass.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const GatepassModel = require("../schema/gatepass.schema")

router.post(
    "/",
    checkSchema(require("../dto/gatepass.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const existingGatepass = await GatepassModel.findOne({
            userId: req.body.userId,
            status: 'Active'
        });
        if (existingGatepass) {
            return res.status(400).json({ message: 'Your last gatepass is active.' });
        }
        const gatepassId = +Date.now();
        req.body.gatepassId = gatepassId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

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

router.get("/all/gatepass", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        status: req.query.status,
        userId: req.query.userId,
        gatepassId: req.query.gatepassId,
        reason: req.query.reason,
        managerUserId: req.query.managerUserId,
        pageNumber: parseInt(req.query.pageNumber) || 1,
        pageSize: parseInt(req.query.pageSize) || 10,
    };
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/getByGatePassId/:id", async (req, res) => {
    const serviceResponse = await service.getByDataId(req.params.id);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/groupId/:groupId/gatepassId/:gatepassId", async (req, res) => {
    try {
        const gatepassId = req.params.gatepassId;
        const groupId = req.params.groupId;
        const Data = await service.deleteByDataId(gatepassId, groupId);
        if (!Data) {
            res.status(404).json({ error: "Data not found to delete" });
        } else {
            res.status(201).json(Data);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/groupId/:groupId/gatepassId/:gatepassId", async (req, res) => {
    const gatepassId = req.params.gatepassId;
    const groupId = req.params.groupId;
    const updateData = req.body;
    try {
        const serviceResponse = await service.updateDataById(
            gatepassId,
            groupId,
            updateData
        );
        if (serviceResponse) {
            const response = {
                data: serviceResponse,
                message: "Data updated successfully",
            };
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: "Data not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
module.exports = router;
