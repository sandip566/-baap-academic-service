const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/manageExamTerm.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const ManageExamTermModel = require("../schema/manageExamTerm.schema");

router.post(
    "/",
    checkSchema(require("../dto/manageGradePattern.dto")),
    async (req, res, next) => {
        const { groupId, classId } = req.body;
        try {
            const existingRecord = await service.findPriority(groupId, classId);
            if (existingRecord) {
                return res.status(400).json({
                    status: "Error",
                    message: "Priority  Already Exists."
                });
            }
            const manageExamTermId = +Date.now();
            req.body.manageExamTermId = manageExamTermId;
            const serviceResponse = await service.create(req.body);
            requestResponsehelper.sendResponse(res, serviceResponse);
        } catch (error) {
            next(error);
        }
    })

router.get("/all/manageExamTerm", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});

    requestResponsehelper.sendResponse(res, serviceResponse);
});


router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        name: req.query.name,
        priority: req.query.priority,
        search: req.query.search,
        classId: req.query.classId,
        manageExamTermId: req.query.manageExamTermId,
        termTypeId:req.query.termTypeId,
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
    "/groupId/:groupId/manageExamTermId/:manageExamTermId",
    async (req, res) => {
        try {
            const manageExamTermId = req.params.manageExamTermId;
            const groupId = req.params.groupId;
            const manageExamTermData = await service.deleteManageExamTermById({
                manageExamTermId: manageExamTermId,
                groupId: groupId,
            });
            if (!manageExamTermData) {
                res.status(404).json({
                    error: "manageExamTerm data not found to delete",
                });
            } else {
                res.status(201).json(manageExamTermData);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);
router.put("/groupId/:groupId/manageExamTermId/:manageExamTermId", async (req, res) => {
    try {
        const manageExamTermId = req.params.manageExamTermId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const updateManageExamTerm = await service.updateManageExamTermById(
            manageExamTermId,
            groupId,
            newData
        );
        if (!updateManageExamTerm) {
            res.status(404).json({
                error: "manageExamTerm data not found to update",
            });
        } else {
            res.status(200).json({
                updateManageExamTerm,
                message: "data update successfully",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const manageExamTermId = req.body.manageExamTerm;

        if (!Array.isArray(manageExamTermId) || manageExamTermId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty manageExamTermId array",
            });
        }

        const numericIds = manageExamTermId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${manageExamTermId}`);
            }
            return num;
        });

        const result = await ManageExamTermModel.deleteMany({
            groupId: groupId,
            manageExamTermId: { $in: numericIds },
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
