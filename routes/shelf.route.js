const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/shelf.services");
const requestResponseHelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const validationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const shelfModel = require("../schema/shelf.schema");

router.post(
    "/",
    checkSchema(require("../dto/shelf.dto")),
    async (req, res, next) => {
        if (validationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const shelfId = +Date.now();
        req.body.shelfId = shelfId;
        if (req.body.capacity !== undefined) {
            req.body.availableCapacity = req.body.capacity;
        }
        req.body.currentInventory =
            req.body.capacity - req.body.availableCapacity;
        const serviceResponse = await service.create(req.body);
        requestResponseHelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all", async (req, res) => {
    const pagination = {
        pageNumber: req.query.pageNumber || 1,
        pageSize: 10,
    };
    const { pageNumber, pageSize, ...query } = req.query;
    const serviceResponse = await service.getAllByCriteria(query, pagination);
    requestResponseHelper.sendResponse(res, serviceResponse);
});
router.get("/all/getByGroupId/:groupId", async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const criteria = {
            shelfName: req.query.shelfName,
            shelfType: req.query.shelfType,
            location: req.query.location,
            capacity: req.query.capacity,
            search: req.query.search,
        };
        const searchFilter = service.getAllDataByGroupId(groupId, criteria);
        const shelf = await shelfModel.find(searchFilter);
        const count = await service.getCount();
        res.json({
            status: "success",
            data: {
                items: shelf,
                totalItemsCount: shelf.length,
                count: count,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.delete("/groupId/:groupId/shelfId/:shelfId", async (req, res) => {
    try {
        const shelfId = req.params.shelfId;
        const groupId = req.params.groupId;
        const data = await service.deleteShelfById(shelfId, groupId);
        if (data === false) {
            res.status(400).json({ error: "Shelf is assigned to a book and cannot be deleted." });
        } else if (!data) {
            res.status(404).json({ error: "Shelf not found." });
        } else {
            res.status(200).json(data);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/groupId/:groupId/shelfId/:shelfId", async (req, res) => {
    try {
        const shelfId = req.params.shelfId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const updateData = await service.updateShelfById(
            shelfId,
            groupId,
            newData
        );
        if (!updateData) {
            res.status(404).json({ error: "Data not found to update" });
        } else {
            res.status(200).json(updateData);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete("/:id", async (req, res) => {
    const serviceResponse = await service.deleteById(req.params.id);
    requestResponseHelper.sendResponse(res, serviceResponse);
});

router.put("/:id", async (req, res) => {
    const serviceResponse = await service.updateById(req.params.id, req.body);
    requestResponseHelper.sendResponse(res, serviceResponse);
});

module.exports = router;
