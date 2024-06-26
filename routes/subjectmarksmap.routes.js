const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/subjectmarksmap.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/subjectmarksmap.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const subjectMarksMapId = +Date.now();
        req.body.subjectMarksMapId = subjectMarksMapId;
        let totalSubjects;
        if (Array.isArray(req.body.subject)) {
            totalSubjects = req.body.subject.length;
        }
        req.body.totalSubjects = totalSubjects
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

router.get("/all/subjectMarksMap", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/getAllByGroupId/groupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        subjectMarksMapId: req.query.subjectMarksMapId,
    };
    const serviceResponse = await service.getAllByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete(
    "/groupId/:groupId/subjectMarksMapId/:subjectMarksMapId",
    async (req, res) => {
        try {
            const subjectMarksMapId = req.params.subjectMarksMapId;
            const groupId = req.params.groupId;
            const deletedData = await service.deleteByDataId({
                subjectMarksMapId: subjectMarksMapId,
                groupId: groupId,
            });
            if (!deletedData) {
                res.status(404).json({
                    error: "data not found to delete",
                });
            } else {
                res.status(201).json(deletedData);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.put(
    "/groupId/:groupId/subjectMarksMapId/:subjectMarksMapId",
    async (req, res) => {
        try {
            const subjectMarksMapId = req.params.subjectMarksMapId;
            const groupId = req.params.groupId;
            const newData = req.body;
            const updatedData = await service.updateByDataId(
                subjectMarksMapId,
                groupId,
                newData
            );
            if (!updatedData) {
                res.status(404).json({
                    error: "data not found to update",
                });
            } else {
                res.status(200).json(updatedData);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.get("/getBysubjectMarksMapId/:id", async (req, res) => {
    const serviceResponse = await service.getByDataId(req.params.id);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/getSubject/groupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        classId: req.query.classId,
        semesterId: req.query.semesterId,
        termId: req.query.termId,
    };
    const serviceResponse = await service.getAllSubject(groupId, criteria);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

module.exports = router;
