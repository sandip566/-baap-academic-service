const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/courses.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const TokenService = require("../services/token.services");
const courseModel = require("../schema/courses.schema")

router.post(
    "/",
    checkSchema(require("../dto/courses.dto")),
    TokenService.checkPermission(["EMC2"]),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const existingRecord = await service.getByCourseIdAndGroupId(
            req.body.groupId,
            req.body.Code,
            req.body.CourseName
        );
        console.log(existingRecord);
        if (existingRecord.data) {
            return res
                .status(404)
                .json({ error: "Code with Same Name Already Exists." });
        }
        const courseId = +Date.now();
        req.body.courseId = courseId;

        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria(req.query);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete(
    "/:id",
    TokenService.checkPermission(["EMC4"]),
    async (req, res) => {
        const serviceResponse = await service.deleteById(req.params.id);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.put(
    "/:id",
    TokenService.checkPermission(["ERPSA3"]),
    async (req, res) => {
        const serviceResponse = await service.updateById(
            req.params.id,
            req.body
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/:id", TokenService.checkPermission(["EMC1"]), async (req, res) => {
    const serviceResponse = await service.getById(req.params.id);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get(
    "/getByCourseId/:courseId",
    TokenService.checkPermission(["EMC1"]),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const serviceResponse = await service.getByCourseId(
            req.params.courseId
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get(
    "/getDataByUsingLink/getByCourseId/:courseId",
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const serviceResponse = await service.getByCourseId(
            req.params.courseId
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get(
    "/all/getByGroupId/:groupId",
    TokenService.checkPermission(["EMC3"]),
    async (req, res) => {
        const groupId = req.params.groupId;
        const criteria = {
            courseId: req.query.courseId,
            CourseName: req.query.CourseName,
            University: req.query.University,
            departmentId: req.query.departmentId,
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
        courseId: req.query.courseId,
        CourseName: req.query.CourseName,
        University: req.query.University,
        departmentId: req.query.departmentId,
    };
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete(
    "/groupId/:groupId/courseId/:courseId",
    TokenService.checkPermission(["EMC4"]),
    async (req, res) => {
        try {
            const courseId = req.params.courseId;
            const groupId = req.params.groupId;
            const courseData = await service.deleteCourseById(
                courseId,
                groupId
            );
            console.log(courseData);
            if (!courseData) {
                res.status(404).json({
                    error: "Course already exist for the provided course.",
                });
            } else {
                res.status(201).json(courseData);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.put(
    "/groupId/:groupId/courseId/:courseId",
    TokenService.checkPermission(["EMC3"]),
    async (req, res) => {
        try {
            const courseId = req.params.courseId;
            const groupId = req.params.groupId;
            const newData = req.body;
            const updatecourse = await service.updateCourseById(
                courseId,
                groupId,
                newData
            );

            if (!updatecourse) {
                res.status(404).json({
                    error: "course data not found to update",
                });
            } else {
                res.status(200).json({
                    updatecourse,
                    message: "data update successfully",
                });
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
        const courseId = req.body.course;

        if (!Array.isArray(courseId) || courseId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty courseId array",
            });
        }

        const numericIds = courseId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${courseId}`);
            }
            return num;
        });

        const result = await courseModel.deleteMany({
            groupId: groupId,
            courseId: { $in: numericIds },
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
