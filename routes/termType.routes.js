const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/termType.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const termTypeModel = require("../schema/termType.schema")

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

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const termTypeId = req.body.termType;

        if (!Array.isArray(termTypeId) || termTypeId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty termTypeId array",
            });
        }

        const numericIds = termTypeId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${termTypeId}`);
            }
            return num;
        });

        const result = await termTypeModel.deleteMany({
            groupId: groupId,
            termTypeId: { $in: numericIds },
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
