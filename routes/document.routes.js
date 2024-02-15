const express = require("express");
const router = express.Router();
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });
const { checkSchema } = require("express-validator");
const service = require("../services/document.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/latefeepayment.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        try {
            if (req.body.memberId) {
                const existingDoc = await service.getBymemberId(req.body.memberId);
                if (existingDoc) {
                    const updatedData = {
                        ...req.body,
                        document: req.file
                    };
                    const serviceResponse = await service.updateData(req.body.memberId, updatedData);
                    requestResponsehelper.sendResponse(res, serviceResponse);
                } else {
                    res.status(404).json({ error: "Document not found for memberId" });
                }
            } else {
                const serviceResponse = await service.saveData(req.body);
                res.json({
                    data: serviceResponse,
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

router.get("/memberId/:id", async (req, res) => {
    const serviceResponse = await service.getByDataId(req.params.id);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/all", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        roleId: req.query.roleId,
        title: req.query.title,
        description: req.query.description,
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

router.delete("/groupId/:groupId/memberId/:memberId", async (req, res) => {
    try {
        const memberId = req.params.memberId;
        const groupId = req.params.groupId;
        const Data = await service.deleteByDataId(memberId, groupId);
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

router.put("/groupId/:groupId/memberId/:memberId", async (req, res) => {
    try {
        const memberId = req.params.memberId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const Data = await service.updateDataById(memberId, groupId, newData);
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
