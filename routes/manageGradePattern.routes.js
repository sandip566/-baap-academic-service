const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service=require("../services/manageGradePattern.service")
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/manageGradePattern.dto")),
    async (req, res, next) => {
        const {groupId, name } = req.body;
        try {
            const existingRecord = await service.findByName(groupId,name);
            if (existingRecord) {
                return res.status(400).json({
                    status: "Error",
                    message: "GradePattern Name Already Exists."
                });
            }
            const gradePatternId = +Date.now();
            req.body.gradePatternId = gradePatternId;
            const serviceResponse = await service.create(req.body);
            requestResponsehelper.sendResponse(res, serviceResponse);
        } catch (error) {
            next(error);
        }
    })
router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        classId: req.query.classId,
        gradePoint: req.query.gradePoint,
        search: req.query.search,
        ceilingValue: req.query.ceilingValue,
        gradePatternId: req.query.gradePatternId,
        remark: req.query.remark,
        floorValue: req.query.floorValue,
        grade: req.query.grade,
        pageNumber:req.query.pageNumber ,
        pageSize:req.query.pageSize 
    };

    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria,
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete(
    "/groupId/:groupId/gradePatternId/:gradePatternId",
    async (req, res) => {
        try {
            const gradePatternId = req.params.gradePatternId;
            const groupId = req.params.groupId;
            const ManageGradePatternData = await service.deleteManageGradePatternById({
                gradePatternId: gradePatternId,
                groupId: groupId,
            });
            if (!ManageGradePatternData) {
                res.status(404).json({
                    error: "ManageGradePattern data not found to delete",
                });
            } else {
                res.status(201).json(ManageGradePatternData);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);
router.put("/groupId/:groupId/gradePatternId/:gradePatternId", async (req, res) => {
    try {
        const gradePatternId = req.params.gradePatternId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const updateManageGradePattern = await service.updateManageGradePatternById(
            gradePatternId,
            groupId,
            newData
        );
        if (!updateManageGradePattern) {
            res.status(404).json({
                error: "ManageGradePattern data not found to update",
            });
        } else {
            res.status(200).json({
                updateManageGradePattern,
                message: "data update successfully",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.get("/all/manageGradePattern", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});

    requestResponsehelper.sendResponse(res, serviceResponse);
});

module.exports = router;
