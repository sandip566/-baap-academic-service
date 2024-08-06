const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/religion.services");
const requestResponseHelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const validationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const TokenService = require("../services/token.services");
const religionModel = require("../schema/religion.schema")

router.post(
    "/",
    checkSchema(require("../dto/religion.dto")),
    TokenService.checkPermission(["EMR2"]),
    async (req, res, next) => {
        if (validationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const existingRecord = await service.getByCourseIdAndGroupId(
            req.body.groupId,
            req.body.religion
        );
        console.log(existingRecord);
        if (existingRecord.data) {
            return res
                .status(409)
                .json({ error: "Code With The Same Name Already Exists." });
        }
        const religionId = +Date.now();
        req.body.religionId = religionId;
        const serviceResponse = await service.create(req.body);
        requestResponseHelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all", async (req, res) => {
    const pagination = {
        pageNumber: req.query.pageNumber || 1,
        pageSize: 10,
    };
    const { pageNumber, pageSize, ...query } = req.query;
    const serviceResponse = await service.getAllByCriteria(query, pagination);
    requestResponseHelper.sendResponse(res, serviceResponse);
});

router.get(
    "/all/getByGroupId/:groupId",
    TokenService.checkPermission(["EMR1"]),
    async (req, res) => {
        const groupId = req.params.groupId;
        const criteria = {
            religionId: req.query.religionId,
            name: req.query.name,
            categoriesId: req.query.categoriesId,
            pageNumber: parseInt(req.query.pageNumber) || 1,
        };
        const serviceResponse = await service.getAllDataByGroupId(
            groupId,
            criteria
        );
        requestResponseHelper.sendResponse(res, serviceResponse);
    }
);

router.get(
    "/getDataByUsingLink/all/getByGroupId/:groupId",
    async (req, res) => {
        const groupId = req.params.groupId;
        const criteria = {
            religionId: req.query.religionId,
            name: req.query.name,
            pageNumber: parseInt(req.query.pageNumber) || 1,
        };
        const serviceResponse = await service.getAllDataByGroupId(
            groupId,
            criteria
        );
        requestResponseHelper.sendResponse(res, serviceResponse);
    }
);

router.delete(
    "/religionId/:religionId",
    TokenService.checkPermission(["EMR4"]),
    async (req, res) => {
        try {
            const religionId = req.params.religionId;
            const data = await service.deleteReligionById({ religionId });
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
    "/religionId/:religionId",
    TokenService.checkPermission(["EMR3"]),
    async (req, res) => {
        try {
            const religionId = req.params.religionId;
            const newData = req.body;
            const updateData = await service.updateReligionById(
                religionId,
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

router.delete(
    "/:id",
    TokenService.checkPermission(["EMR4"]),
    async (req, res) => {
        const serviceResponse = await service.deleteById(req.params.id);
        requestResponseHelper.sendResponse(res, serviceResponse);
    }
);

router.put("/:id", TokenService.checkPermission(["EMR3"]), async (req, res) => {
    const serviceResponse = await service.updateById(req.params.id, req.body);
    requestResponseHelper.sendResponse(res, serviceResponse);
});

router.get("/:id", async (req, res) => {
    const serviceResponse = await service.getById(req.params.id);
    requestResponseHelper.sendResponse(res, serviceResponse);
});

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const religionId = req.body.religion;

        if (!Array.isArray(religionId) || religionId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty religionId array",
            });
        }

        const numericIds = religionId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${religionId}`);
            }
            return num;
        });

        const result = await religionModel.deleteMany({
            groupId: groupId,
            religionId: { $in: numericIds },
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
