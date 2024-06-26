const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/attachmentName.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/attachmentName.dto")),
    async (req, res, next) => {
        const { name } = req.body;

        try {
            const existingRecord = await service.findByName(name);
            if (existingRecord) {
                return res.status(400).json({
                    status: "Error",
                    message: "Ataachment Name Already Exists."
                });
            }
            const attachmentId = +Date.now();
            req.body.attachmentId = attachmentId;
            const serviceResponse = await service.create(req.body);
            requestResponsehelper.sendResponse(res, serviceResponse);
        } catch (error) {
            next(error);
        }
    }
);

router.get("/all/attachmentName", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        name: req.query.name,
        attachmentId: req.query.attachmentId,
        search: req.query.search,
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
    "/groupId/:groupId/attachmentId/:attachmentId",
    async (req, res) => {
        try {
            const attachmentId = req.params.attachmentId;
            const groupId = req.params.groupId;
            const attachmentmData = await service.deleteAttachmentById({
                attachmentId: attachmentId,
                groupId: groupId,
            });
            if (!attachmentmData) {
                res.status(404).json({
                    error: "attachmentm data not found to delete",
                });
            } else {
                res.status(201).json(attachmentmData);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);
router.put("/groupId/:groupId/attachmentId/:attachmentId", async (req, res) => {
    try {
        const attachmentId = req.params.attachmentId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const updateAttacmentData = await service.updateAttachmentById(
            attachmentId,
            groupId,
            newData
        );
        if (!updateAttacmentData) {
            res.status(404).json({
                error: " updateAttacment data not found to update",
            });
        } else {
            res.status(200).json({
                updateAttacmentData,
                message: "data update successfully",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




module.exports = router;
