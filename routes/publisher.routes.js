const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/publisher.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const publisherModel = require("../schema/publisher.schema");

router.post(
    "/",
    checkSchema(require("../dto/publisher.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const publisherId = +Date.now();
        req.body.publisherId = publisherId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all", async (req, res) => {
    const pagination = {
        pageNumber: req.query.pageNumber || 1,
        pageSize: 10,
    };
    const { pageNumber, pageSize, ...query } = req.query;
    const serviceResponse = await service.getAllByCriteria(query, pagination);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        publisherName: req.query.publisherName,
        publisherId: req.query.publisherId,
        phoneNumber: req.query.phoneNumber,
        search: req.query.search,
        address: req.query.address,
        website: req.query.website,
    };

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;

    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria,
        page,
        limit
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.delete(
    "/groupId/:groupId/publisherId/:publisherId",
    async (req, res) => {
        try {
            const publisherId = req.params.publisherId;
            const groupId = req.params.groupId;
            const publisherData = await service.deletePublisherById({
                publisherId: publisherId,
                groupId: groupId,
            });
            if (!publisherData) {
                res.status(404).json({
                    error: "publisher data not found to delete",
                });
            } else {
                res.status(201).json(publisherData);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);
router.put("/groupId/:groupId/publisherId/:publisherId", async (req, res) => {
    try {
        const publisherId = req.params.publisherId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const updatePublisher = await service.updatePublisherById(
            publisherId,
            groupId,
            newData
        );
        if (!updatePublisher) {
            res.status(404).json({
                error: "publisher data not found to update",
            });
        } else {
            res.status(200).json({
                updatePublisher,
                message: "data update successfully",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/totalPublisher", async (req, res) => {
    try {
        const publisher = await publisherModel.find();
        res.json({ total: publisher.length });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const publisherId = req.body.publisher;

        if (!Array.isArray(publisherId) || publisherId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty publisherId array",
            });
        }

        const numericIds = publisherId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${publisherId}`);
            }
            return num;
        });

        const result = await publisherModel.deleteMany({
            groupId: groupId,
            publisherId: { $in: numericIds },
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
