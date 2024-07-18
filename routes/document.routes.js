const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/document.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const DocumentModel = require("../schema/document.schema");

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

router.post(
    "/data/save",
    checkSchema(require("../dto/document.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        try {
            if (req.body.documentId) {
                const existingDocument = await service.getByDocumentId(
                    req.body.documentId
                );
                if (existingDocument) {
                    const updatedData = {
                        ...req.body,
                        documentUrl: req.body.documentUrl,
                    };
                    const serviceResponse = await service.updateDocument(
                        req.body.documentId,
                        updatedData
                    );
                    requestResponsehelper.sendResponse(res, serviceResponse);
                } else {
                    res.status(404).json({ error: "Document not found" });
                }
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
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

    const serviceResponse = await service.getAll({
        user,
        headers,
        query,
        pagination,
    });
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        roleId: req.query.roleId,
        title: req.query.title,
        description: req.query.description,
        documentCategoryId: req.query.documentCategoryId,
        userId: req.query.userId,
        pageNumber: parseInt(req.query.pageNumber) || 1,
        pageSize: parseInt(req.query.pageSize) || 100,
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
            res.status(404).json({ error: "Data not found to delete" });
        } else {
            res.status(201).json(Data);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/groupId/:groupId/documentId/:documentId", async (req, res) => {
    try {
        const documentId = req.params.documentId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const Data = await service.updateDataById(documentId, groupId, newData);
        if (!Data) {
            res.status(404).json({ error: "Data not found to update" });
        } else {
            res.status(201).json(Data);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const documentId = req.body.document;

        if (!Array.isArray(documentId) || documentId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty documentId array",
            });
        }

        const numericIds = documentId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${documentId}`);
            }
            return num;
        });

        const result = await DocumentModel.deleteMany({
            groupId: groupId,
            documentId: { $in: numericIds },
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
