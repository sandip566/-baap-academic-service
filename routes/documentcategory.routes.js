const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/documentcategory.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const DocumentCategoryModel = require("../schema/documentcategory.schema");

router.post(
    "/",
    checkSchema(require("../dto/documentcategory.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const documentCategoryId = +Date.now();
        req.body.documentCategoryId = documentCategoryId;
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

router.get("/all/documentCategory", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        roleId: req.query.roleId,
        documenCategoryId: req.query.documenCategoryId,
        userId: req.query.userId,
        name: req.query.name
    };
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/groupId/:groupId/documentCategoryId/:documentCategoryId", async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const documentCategoryId = req.params.documentCategoryId;

        const data = await service.deleteByDataId(groupId, documentCategoryId);
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(404).json({ message: "Document category not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/groupId/:groupId/documentCategoryId/:documentCategoryId", async (req, res) => {
    try {
        const documentCategoryId = req.params.documentCategoryId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const Data = await service.updateDataById(groupId, documentCategoryId, newData);
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
        const documentCategoryId = req.body.documentCategory;

        if (!Array.isArray(documentCategoryId) || documentCategoryId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty documentCategoryId array",
            });
        }

        const numericIds = documentCategoryId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${documentCategoryId}`);
            }
            return num;
        });

        const result = await DocumentCategoryModel.deleteMany({
            groupId: groupId,
            documentCategoryId: { $in: numericIds },
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
