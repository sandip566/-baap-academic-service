const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/categories.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const TokenService = require("../services/token.services");
const categoriesModel = require("../schema/categories.schema")

router.post(
    "/",
    checkSchema(require("../dto/categories.dto")),
    TokenService.checkPermission(["EFC2"]),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const existingRecord = await service.getByCourseIdAndGroupId(
            req.body.groupId,
            req.body.name,
            req.body.religionId
        );
        console.log(existingRecord);
        if (existingRecord.data) {
            return res
                .status(409)
                .json({ error: " Same Name Already Exists." });
        }
        const categoriseId = +Date.now();
        req.body.categoriseId = categoriseId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all", TokenService.checkPermission(["EFC1"]), async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/getAllDataUsingLink/all", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});
    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.get(
    "/all/getByGroupId/:groupId",
    TokenService.checkPermission(["EFC1"]),
    async (req, res) => {
        const groupId = req.params.groupId;
        const criteria = {
            categoriesId: req.query.categoriesId,
            religionId: req.query.religionId,
            name: req.query.name,
            // pageNumber: parseInt(req.query.pageNumber) || 1
        };
        const serviceResponse = await service.getAllDataByGroupId(
            groupId,
            criteria
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
router.get(
    "/getAllDataUsingLink/all/getByGroupId/:groupId",
    async (req, res) => {
        const groupId = req.params.groupId;
        const criteria = {
            categoriesId: req.query.categoriesId,
            religionId: req.query.religionId,
            name: req.query.name,
        };
        const serviceResponse = await service.getAllDataByGroupId(
            groupId,
            criteria
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
router.delete(
    "/:id",
    TokenService.checkPermission(["EFC4"]),
    async (req, res) => {
        const serviceResponse = await service.deleteById(req.params.id);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.put("/:id", TokenService.checkPermission(["EFC2"]), async (req, res) => {
    const serviceResponse = await service.updateById(req.params.id, req.body);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/:id", TokenService.checkPermission(["EFC1"]), async (req, res) => {
    const serviceResponse = await service.getById(req.params.id);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete(
    "/categoriesId/:categoriesId",
    TokenService.checkPermission(["EFC4"]),
    async (req, res) => {
        try {
            const categoriesId = req.params.categoriesId;
            const data = await service.deleteCategoriesById({ categoriesId });
            if (!data) {
                res.status(404).json({ error: "Data not found to delete" });
            } else {
                res.status(201).json(data);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.put(
    "/categoriesId/:categoriesId",
    TokenService.checkPermission(["EFC3"]),
    async (req, res) => {
        try {
            const categoriesId = req.params.categoriesId;
            const newData = req.body;
            const updateData = await service.updateCategoriesById(
                categoriesId,
                newData
            );
            if (!updateData) {
                res.status(404).json({ error: "Data not found to update" });
            } else {
                res.status(200).json(updateData);
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
        const categoriesId = req.body.categories;

        if (!Array.isArray(categoriesId) || categoriesId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty categoriesId array",
            });
        }

        const numericIds = categoriesId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${categoriesId}`);
            }
            return num;
        });

        const result = await categoriesModel.deleteMany({
            groupId: groupId,
            categoriesId: { $in: numericIds },
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
