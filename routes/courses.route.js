const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/courses.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require('../dto/courses.dto')),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const existingRecord = await service.getByCourseIdAndGroupId(req.body.groupId,req.body.Code,req.body.name);
        console.log(existingRecord);
        if (existingRecord.data) {
           
            return res.status(404).json({ error: "Code With The Same GroupId Already Exists." });
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
router.get("/getByCourseId/:courseId", async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }
    const serviceResponse = await service.getByCourseId(req.params.courseId);
    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        courseId: req.query.courseId,
        CourseName: req.query.CourseName,
        University: req.query.University,
    };
    const serviceResponse = await service.getAllDataByGroupId(groupId, criteria);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/groupId/:groupId/courseId/:courseId", async (req, res) => {
   
    try {
        const courseId = req.params.courseId;
        const groupId = req.params.groupId;
        const courseData = await service.deleteCourseById({
            courseId: courseId,
            groupId: groupId,
        });
        if (!courseData) {
            res.status(404).json({
                error: "course data not found to delete",
            });
        } else {
            res.status(201).json(courseData);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/groupId/:groupId/courseId/:courseId", async (req, res) => {
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
            res.status(200).json({ updatecourse, message: "data update successfully" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
module.exports = router;
