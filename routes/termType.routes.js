const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/termType.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/termType.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const termTypeId=+Date.now();
        req.body.termTypeId=termTypeId
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);


router.get("/all/termType", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        academicYearId: req.query.academicYearId,
        name: req.query.name,
        search: req.query.search,
        termTypeId: req.query.termTypeId,
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
    "/groupId/:groupId/termTypeId/:termTypeId",
    async (req, res) => {
        try {
            const termTypeId = req.params.termTypeId;
            const groupId = req.params.groupId;
            const termTypeData = await service.deleteTermTypeById({
                termTypeId: termTypeId,
                groupId: groupId,
            });
            if (!termTypeData) {
                res.status(404).json({
                    error: "TermType data not found to delete",
                });
            } else {
                res.status(201).json(termTypeData);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);
router.put("/groupId/:groupId/termTypeId/:termTypeId", async (req, res) => {
    try {
        const termTypeId = req.params.termTypeId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const updateTermType = await service.updateTermTypeById(
            termTypeId,
            groupId,
            newData
        );
        if (!updateTermType) {
            res.status(404).json({
                error: "TermType data not found to update",
            });
        } else {
            res.status(200).json({
                updateTermType,
                message: "data update successfully",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router;
