const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/division.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const TokenService = require("../services/token.services");
const DivisionModel = require("../schema/division.schema");

router.post(
    "/",
    checkSchema(require("../dto/division.dto")),
    TokenService.checkPermission(["EMDD2"]),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const existingRecord = await service.getByCourseIdAndGroupId(
            req.body.groupId,
            req.body.Name,
            req.body.courseId,
            req.body.classId
        );
        console.log(existingRecord);
        if (existingRecord.data) {
            return res
                .status(404)
                .json({ error: "Data With The Same GroupId Already Exists." });
        }
        const divisionId = +Date.now();
        req.body.divisionId = divisionId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete(
    "/:id",
    TokenService.checkPermission(["EMDD4"]),
    async (req, res) => {
        const serviceResponse = await service.deleteById(req.params.id);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.put(
    "/:id",
    TokenService.checkPermission(["EMDD3"]),
    async (req, res) => {
        const serviceResponse = await service.updateById(
            req.params.id,
            req.body
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get(
    "/:id",
    TokenService.checkPermission(["EMDD1"]),
    async (req, res) => {
        const serviceResponse = await service.getById(req.params.id);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.delete(
    "/groupId/:groupId/divisionId/:divisionId",
    TokenService.checkPermission(["EMDD4"]),
    async (req, res) => {
        try {
            const divisionId = req.params.divisionId;
            const groupId = req.params.groupId;
            const divisionData = await service.deleteByDivisionId({
                divisionId: divisionId,
                groupId: groupId,
            });
            if (!divisionData) {
                res.status(404).json({
                    warning: "Division data not found to delete",
                });
            } else {
                res.status(201).json(divisionData);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.put(
    "/groupId/:groupId/divisionId/:divisionId",
    TokenService.checkPermission(["EMDD3"]),
    async (req, res) => {
        try {
            const divisionId = req.params.divisionId;
            const groupId = req.params.groupId;
            const newData = req.body;
            const updatedData = await service.updateDivisionById(
                divisionId,
                groupId,
                newData
            );
            if (!updatedData) {
                res.status(404).json({ error: "Division not found to update" });
            } else {
                res.status(201).json(updatedData);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.get(
    "/all/getByGroupId/:groupId",
    TokenService.checkPermission(["EMDD1"]),
    async (req, res) => {
        const groupId = req.params.groupId;
        const criteria = {
            Name: req.query.Name,
            courseId: req.query.courseId,
            classId: req.query.classId,
            divisionId: req.query.divisionId,
            incharge: req.query.incharge,
            Department: req.query.departmentId,
        };
        const serviceResponse = await service.getAllDataByGroupId(
            groupId,
            criteria
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get(
    "/getDataByUsingLink/all/getByGroupId/:groupId",
    async (req, res) => {
        const groupId = req.params.groupId;
        const criteria = {
            Name: req.query.Name,
            courseId: req.query.courseId,
            classId: req.query.classId,
            divisionId: req.query.divisionId,
            incharge: req.query.incharge,
            Department: req.query.departmentId,
        };
        const serviceResponse = await service.getAllDataByGroupId(
            groupId,
            criteria
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const divisionId = req.body.division;

        if (!Array.isArray(divisionId) || divisionId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty divisionId array",
            });
        }

        const numericIds = divisionId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${divisionId}`);
            }
            return num;
        });

        const result = await DivisionModel.deleteMany({
            groupId: groupId,
            divisionId: { $in: numericIds },
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
