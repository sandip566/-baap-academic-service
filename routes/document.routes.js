const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/document.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/document.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const documentId = +Date.now();
        req.body.documentId = documentId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/documentId/:id", async (req, res) => {
    const serviceResponse = await service.getByDataId(req.params.id);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/getByCategory/:category", async (req, res) => {
    const serviceResponse = await service.getByCategory(req.params.category);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/all", async (req, res) => {
    const { pageNumber = 1, pageSize = 10, ...query } = req.query;
    const { user, headers } = req;
    const pagination = { pageNumber, pageSize };

    const serviceResponse = await service.getAll({ user, headers, query, pagination });
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        roleId: req.query.roleId,
        title: req.query.title,
        description: req.query.description,
        category: req.query.category
    };
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria
    );
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

router.delete("/groupId/:groupId/documentId/:documentId", async (req, res) => {
    try {
        const documentId = req.params.documentId;
        const groupId = req.params.groupId;
        const Data = await service.deleteByDataId(documentId, groupId);
        if (!Data) {
            res.status(404).json({ error: 'Data not found to delete' });
        } else {
            res.status(201).json(Data);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put("/groupId/:groupId/documentId/:documentId", async (req, res) => {
    try {
        const documentId = req.params.documentId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const Data = await service.updateDataById(documentId, groupId, newData);
        if (!Data) {
            res.status(404).json({ error: 'Data not found to update' });
        } else {
            res.status(201).json(Data);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
