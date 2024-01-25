const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/noticeBoard.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
//create noticeBoardNo sequential
let noticeBoardId = 1;
function generateNoticeNumber() {
    const sequentialPart = noticeBoardId++;
    return `${sequentialPart.toString().padStart(0, "0")}`;
}
router.post(
    "/",
    checkSchema(require("../dto/noticeBoard.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        req.body.noticeBoardId = generateNoticeNumber();
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

router.get("/all/notice", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/getAllNotice/groupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        noticeBoardId: req.query.noticeBoardId,
        studentId: req.query.studentId,
        memberId: req.query.memberId,
        title: req.query.title,
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
            const deletenoticeBoardNo = await service.deleteNoticeBoardByNo({
                noticeBoardId: noticeBoardId,
                groupId: groupId,
            });
            if (!deletenoticeBoardNo) {
                res.status(404).json({
                    error: "delete noticeBoard data not found to delete",
                });
            } else {
                res.status(201).json(deletenoticeBoardNo);
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
            const updateNoticeBoard = await service.updateNoticeBoardByNo(
                noticeBoardId,
                groupId,
                newData
            );
            if (!updateNoticeBoard) {
                res.status(404).json({
                    error: "update noticeBoard data not found to update",
                });
            } else {
                res.status(200).json(updateNoticeBoard);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);
module.exports = router;
