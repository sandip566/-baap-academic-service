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
    try {
        const groupId = req.params.groupId;
        const criteria = {
            name: req.query.name,
            publisherId: req.query.publisherId,
            phoneNumber: req.query.phoneNumber,
            search:req.query.search,
            address: req.query.address,
            website: req.query.website
        };

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;

        const { searchFilter } = await service.getAllDataByGroupId(
            groupId,
            criteria,
            skip,
            limit,
        );
        const totalCount = await publisherModel.countDocuments(searchFilter);
        const publisher = await publisherModel.find(searchFilter)
            .find(searchFilter)
            .skip(skip)
            .limit(limit)
            .exec();

        res.json({
            status: "Success",
            data: {
                items: publisher,
                totalCount: totalCount,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});
router.delete("/groupId/:groupId/publisherId/:publisherId", async (req, res) => {
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
});
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
                updatebook,
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

module.exports = router;
