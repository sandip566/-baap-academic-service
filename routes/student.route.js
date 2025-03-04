const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/student.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const studentModel = require("../schema/student.schema")

router.post(
    "/",
    checkSchema(require("../dto/student.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const studentId = +Date.now();
        req.body.studentId = studentId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});
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

router.get("/getAllstudents/groupId/:groupId", async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const criteria = {
            studentId: req.query.studentId,
            name: req.query.name,
            dob: req.query.dob,
        };
        const sortOptions = { createdAt: -1 };
        const serviceResponse = await service.getAllDataByGroupId(
            groupId,
            criteria,
            sortOptions
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete("/groupId/:groupId/studentId/:studentId", async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const groupId = req.params.groupId;
        const studentData = await service.deleteStudentById(studentId, groupId);
        if (!studentData) {
            res.status(404).json({ error: "Data not found to delete" });
        } else {
            res.status(201).json(studentData);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/groupId/:groupId/studentId/:studentId", async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const updateStudent = await service.updateStudentById(
            studentId,
            groupId,
            newData
        );
        if (!updateStudent) {
            res.status(404).json({ error: "Data not found to update" });
        } else {
            res.status(200).json(updateStudent);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const studentId = req.body.student;

        if (!Array.isArray(studentId) || studentId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty studentId array",
            });
        }

        const numericIds = studentId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${studentId}`);
            }
            return num;
        });

        const result = await studentModel.deleteMany({
            groupId: groupId,
            studentId: { $in: numericIds },
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
