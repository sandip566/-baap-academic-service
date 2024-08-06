const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/marksheetName.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const markSheetModel = require("../schema/marksheetName.schema")

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

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const markSheetId = req.body.markSheet;

        if (!Array.isArray(markSheetId) || markSheetId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty markSheetId array",
            });
        }

        const numericIds = markSheetId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${markSheetId}`);
            }
            return num;
        });

        const result = await markSheetModel.deleteMany({
            groupId: groupId,
            markSheetId: { $in: numericIds },
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
