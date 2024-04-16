const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/assignedasset.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/assignedasset.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const assignedId = +Date.now();
        req.body.assignedId = assignedId;
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

router.get("/all/assignedAsset", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});
    requestResponsehelper.sendResponse(res, serviceResponse);
});


router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        name: req.query.name,
        type: req.query.type,
        status: req.query.status,
        category: req.query.category,
        pageNumber: parseInt(req.query.pageNumber) || 1,
        pageSize: parseInt(req.query.pageSize) || 10,
    };
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});


router.get("/getByAssignedId/:id", async (req, res) => {
    const serviceResponse = await service.getByDataId(req.params.id);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/groupId/:groupId/assignedId/:assignedId", async (req, res) => {
    try {
        const assignedId = req.params.assignedId;
        const groupId = req.params.groupId;
        const Data = await service.deleteByDataId(assignedId, groupId);
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

router.put("/groupId/:groupId/assignedId/:assignedId", async (req, res) => {
    const assignedId = req.params.assignedId;
    const groupId = req.params.groupId;
    const updateData = req.body;
    try {
        const serviceResponse = await service.updateDataById(assignedId, groupId, updateData);
        if (serviceResponse) {
            const response = { data: serviceResponse, message: "Data updated successfully" };
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
