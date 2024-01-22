const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/relegion.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/relegion.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const relegionId = +Date.now();
        req.body.relegionId = relegionId;
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

router.get("/all/relegions", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria(req.query);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        relegionId: req.query.relegionId,
        name: req.query.name
    };
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/groupId/:groupId/relegionId/:relegionId", async (req, res) => {
    try {
        const relegionId = req.params.relegionId
        const groupId = req.params.groupId
        const Data = await service.deleteRelegionById({ relegionId: relegionId, groupId: groupId });
        if (!Data) {
            res.status(404).json({ error: 'Relegion data not found to delete' });
        } else {
            res.status(201).json(Data);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put("/groupId/:groupId/relegionId/:relegionId", async (req, res) => {
    try {
        const relegionId = req.params.relegionId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const updateData = await service.updateRelegionById(relegionId, groupId, newData);
        if (!updateData) {
            res.status(404).json({ error: 'data not found to update' });
        } else {
            res.status(200).json(updateData);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = router;
