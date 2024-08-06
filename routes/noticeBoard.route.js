const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/noticeBoard.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const noticeBoardModel = require("../schema/noticeBoard.schema")

router.post(
    "/",
    checkSchema(require("../dto/noticeBoard.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const noticeBoardId = +Date.now();
        req.body.noticeBoardId = noticeBoardId;
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

router.get("/getAllNotice/groupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        noticeBoardId: req.query.noticeBoardId,
        title: req.query.title,
        isActive: req.query.isActive,
    };
    const serviceResponse = await service.getAllNoticeByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete(
    "/groupId/:groupId/noticeBoardId/:noticeBoardId",
    async (req, res) => {
        try {
            const noticeBoardId = req.params.noticeBoardId;
            const groupId = req.params.groupId;
            const deletednoticeBoardId = await service.deleteNoticeBoardById({
                noticeBoardId: noticeBoardId,
                groupId: groupId,
            });
            if (!deletednoticeBoardId) {
                res.status(404).json({
                    error: "noticeBoard data not found to delete",
                });
            } else {
                res.status(201).json(deletednoticeBoardId);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.put(
    "/groupId/:groupId/noticeBoardId/:noticeBoardId",
    async (req, res) => {
        try {
            const noticeBoardId = req.params.noticeBoardId;
            const groupId = req.params.groupId;
            const newData = req.body;
            const updatedNoticeBoard = await service.updateNoticeBoardById(
                noticeBoardId,
                groupId,
                newData
            );
            if (!updatedNoticeBoard) {
                res.status(404).json({
                    error: "noticeBoard data not found to update",
                });
            } else {
                res.status(200).json(updatedNoticeBoard);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.get("/getByNoticeBoardId/:id", async (req, res) => {
    const serviceResponse = await service.getByDataId(req.params.id);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const noticeBoardId = req.body.noticeBoard;

        if (!Array.isArray(noticeBoardId) || noticeBoardId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty noticeBoardId array",
            });
        }

        const numericIds = noticeBoardId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${noticeBoardId}`);
            }
            return num;
        });

        const result = await noticeBoardModel.deleteMany({
            groupId: groupId,
            noticeBoardId: { $in: numericIds },
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
