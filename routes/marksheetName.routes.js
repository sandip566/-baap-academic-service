const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/marksheetName.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/marksheetName.dto")),
    async (req, res, next) => {
        const {groupId, name } = req.body;
        try {
            const existingRecord = await service.findByName(groupId,name);
            if (existingRecord) {
                return res.status(400).json({
                    status: "Error",
                    message: "Marksheet Already Exists."
                });
            }
            const markSheetId = +Date.now();
            req.body.markSheetId = markSheetId;
            const serviceResponse = await service.create(req.body);
            requestResponsehelper.sendResponse(res, serviceResponse);
        } catch (error) {
            next(error);
        }
    }
);

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        classId: req.query.classId,
        search: req.query.search,
        markSheetId: req.query.markSheetId,
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
    "/groupId/:groupId/markSheetId/:markSheetId",
    async (req, res) => {
        try {
            const markSheetId = req.params.markSheetId;
            const groupId = req.params.groupId;
            const MarksheetData = await service.deleteMarksheetById({
                markSheetId: markSheetId,
                groupId: groupId,
            });
            if (!MarksheetData) {
                res.status(404).json({
                    error: "Marksheet data not found to delete",
                });
            } else {
                res.status(201).json(MarksheetData);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);
router.put("/groupId/:groupId/markSheetId/:markSheetId", async (req, res) => {
    try {
        const markSheetId = req.params.markSheetId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const updateMarksheet = await service.updateMarksheetById(
            markSheetId,
            groupId,
            newData
        );
        if (!updateMarksheet) {
            res.status(404).json({
                error: "Marksheet data not found to update",
            });
        } else {
            res.status(200).json({
                updateMarksheet,
                message: "data update successfully",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.get("/all/marksheetName", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});

    requestResponsehelper.sendResponse(res, serviceResponse);
});

module.exports = router;
