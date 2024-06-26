const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/manageExamTerm.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/manageExamTerm.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const manageExamTermId=+Date.now();
        req.body.manageExamTermId=manageExamTermId
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

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


module.exports = router;
