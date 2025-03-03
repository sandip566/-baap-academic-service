const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/subjects.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const TokenService = require("../services/token.services");
const studentModel = require("../schema/student.schema");

router.post(
    "/",
    checkSchema(require("../dto/subject.dto")),
    TokenService.checkPermission(["EMS2"]),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const existingRecord = await service.getBySubjectIdAndGroupId(
            req.body.groupId,
            req.body.name,
            req.body.classId
        );
        console.log(existingRecord);
        if (existingRecord.data) {
            return res.status(404).json({
                error: "Name,Code With The Same GroupId Already Exists.",
            });
        }
        const subjectId = +Date.now();
        req.body.subjectId = subjectId;
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
    TokenService.checkPermission(["EMS4"]),
    async (req, res) => {
        const serviceResponse = await service.deleteById(req.params.id);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.put("/:id", TokenService.checkPermission(["EMS3"]), async (req, res) => {
    const serviceResponse = await service.updateById(req.params.id, req.body);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/:id", TokenService.checkPermission(["EMS1"]), async (req, res) => {
    const serviceResponse = await service.getById(req.params.id);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete(
    "/groupId/:groupId/subjectId/:subjectId",
    TokenService.checkPermission(["EMS4"]),
    async (req, res) => {
        try {
            const subjectId = req.params.subjectId;
            const groupId = req.params.groupId;
            const subjectData = await service.deleteBySubjectId({
                subjectId: subjectId,
                groupId: groupId,
            });
            if (!subjectData) {
                res.status(404).json({
                    error: "Subject data not found to delete",
                });
            } else {
                res.status(201).json(subjectData);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.put(
    "/groupId/:groupId/subjectId/:subjectId",
    TokenService.checkPermission(["EMS3"]),
    async (req, res) => {
        try {
            const subjectId = req.params.subjectId;
            const groupId = req.params.groupId;
            const newData = req.body;
            const updatedData = await service.updateSubjectById(
                subjectId,
                groupId,
                newData
            );
            if (!updatedData) {
                res.status(404).json({ error: "Subject not found to update" });
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
    TokenService.checkPermission(["EMS1"]),
    async (req, res) => {
        const groupId = req.params.groupId;
        const criteria = {
            subjectName: req.query.subjectName,
            courseId: req.query.courseId,
            semesterId: req.query.semesterId,
            divisionId: req.query.divisionId,
            classId: req.query.classId,
            subjectId: req.query.subjectId,
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
        const subjectId = req.body.students;

        if (!Array.isArray(subjectId) || subjectId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty subjectId array",
            });
        }

        const numericIds = subjectId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${subjectId}`);
            }
            return num;
        });

        const result = await studentModel.deleteMany({
            groupId: groupId,
            subjectId: { $in: numericIds },
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
