const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/transportcoordinator.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/transportcoordinator.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const transportCoordinatorId = +Date.now();
        req.body.transportCoordinatorId = transportCoordinatorId
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

router.get("/all/TransportCoordinator", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    let { phoneNumber, name, search, page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit);
    const serviceResponse = await service.getAllDataByGroupId(
        groupId, phoneNumber, name, search, page, limit
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/getTransportCo-ordinatorId/:transportCoordinatorId", async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }
    const serviceResponse = await service.getBytransportCoordinatorId(req.params.transportCoordinatorId);

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/groupId/:groupId/transportCoordinatorId/:transportCoordinatorId", async (req, res) => {
    try {
        const transportCoordinatorId = req.params.transportCoordinatorId;
        const groupId = req.params.groupId;
        const Data = await service.deletetransportcoordinatorById({
            transportCoordinatorId: transportCoordinatorId,
            groupId: groupId,
        });
        if (!Data) {
            res.status(404).json({ error: "vehicle data not found to delete" });
        } else {
            res.status(201).json(Data);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/groupId/:groupId/transportCoordinatorId/:transportCoordinatorId", async (req, res) => {
    try {
        const transportCoordinatorId = req.params.transportCoordinatorId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const updateData = await service.updateTransportCoordinatorById(
            transportCoordinatorId,
            groupId,
            newData
        );
        if (!updateData) {
            res.status(404).json({ error: "data not found to update" });
        } else {
            res.status(200).json(updateData);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router;
