const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/classes.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const TokenService = require("../services/token.services");
const ClassModel = require("../schema/classes.schema");

router.post(
    "/",
    checkSchema(require("../dto/classes.dto")),
    TokenService.checkPermission(["EMDC2"]),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const existingRecord = await service.getByCourseIdAndGroupId(
            req.body.groupId,
            req.body.name,
            req.body.courseId
        );
        console.log(existingRecord);
        if (existingRecord.data) {
            return res
                .status(400)
                .json({ error: "Name With The Same GroupId Already Exists." });
        }
        const classId = +Date.now();
        req.body.classId = classId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get(
    "/all",
    TokenService.checkPermission(["EMDC1"]),
    async (req, res) => {
        const serviceResponse = await service.getAllByCriteria(req.query);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.delete(
    "/:id",
    TokenService.checkPermission(["EMDC4"]),
    async (req, res) => {
        const serviceResponse = await service.deleteById(req.params.id);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.put(
    "/:id",
    TokenService.checkPermission(["EMDC3"]),
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
    TokenService.checkPermission(["EMDC1"]),
    async (req, res) => {
        const serviceResponse = await service.getById(req.params.id);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get(
    "/all/getByGroupId/:groupId",
    TokenService.checkPermission(["EMDC1"]),
    async (req, res) => {
        const groupId = req.params.groupId;
        const criteria = {
            classId: req.query.classId,
            name: req.query.name,
            courseId: req.query.courseId,
            Department: req.query.departmentId,
        };
        const serviceResponse = await service.getAllDataByGroupId(
            groupId,
            criteria
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/getAllUsingLink/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        classId: req.query.classId,
        name: req.query.name,
        courseId: req.query.courseId,
        Department: req.query.departmentId,
    };
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const classId = req.body.class;

        if (!Array.isArray(classId) || classId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty classId array",
            });
        }

        const numericIds = classId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${classId}`);
            }
            return num;
        });

        const result = await ClassModel.deleteMany({
            groupId: groupId,
            classId: { $in: numericIds },
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
