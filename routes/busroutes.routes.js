const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/busroutes.service");
const { default: mongoose } = require("mongoose");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const BusRoutesModel = require("../schema/busroutes.schema");

router.post(
    "/",
    checkSchema(require("../dto/busroutes.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const { groupId, number } = req.body;
        const existingRoute = await service.findByRouteNo(groupId, number);
        if (existingRoute) {
            return res.status(400).json({ error: "This number is already exists" });
        }
        const routeId = +Date.now();
        req.body.routeId = routeId;
        if (!req.body.stopDetails || req.body.stopDetails.length === 0) {
            req.body.stopDetails = [];
        } else {
            req.body.stopDetails = req.body.stopDetails.map((stopDetailsData) => {
                const stopId = Date.now() + Math.floor(Math.random() * 10000);
                return {
                    _id: new mongoose.Types.ObjectId(),
                    stopId: stopId,
                    stopName: stopDetailsData.stopName,
                    fees: stopDetailsData.fees,
                    location: {
                        lattitude: stopDetailsData.location.lattitude,
                        longitude: stopDetailsData.location.longitude
                    }
                };
            });
        }
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

router.get("/all/busRoutes", async (req, res) => {
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
    let { phoneNumber, name, search, page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit);
    const serviceResponse = await service.getAllDataByGroupId(
        groupId, phoneNumber, name, search, page, limit
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/getrouteId/:routeId", async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }
    const serviceResponse = await service.getByrouteId(req.params.routeId);

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/getRoutesByuserId/groupId/:groupId/userId/:userId", async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }
    const serviceResponse = await service.getRouteByuserId(
        req.params.groupId,
        req.params.userId
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/groupId/:groupId/routeId/:routeId", async (req, res) => {
    try {
        const routeId = req.params.routeId;
        const groupId = req.params.groupId;
        const Data = await service.deleteRoute({
            routeId: routeId,
            groupId: groupId,
        });
        if (!Data) {
            res.status(404).json({
                error: "route data not found to delete",
            });
        } else {
            res.status(201).json(Data);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/groupId/:groupId/routeId/:routeId", async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const routeId = req.params.routeId;
        const newData = req.body;

        const existingRoute = await service.findRouteByNoExcludeCurrent(groupId, newData.number, routeId);
        if (existingRoute) {
            return res.status(409).json({ error: "Route number already exists" });
        }

        const updateData = await service.updateRouteById(groupId, routeId, newData);
        if (!updateData) {
            return res.status(404).json({ error: "Data not found to update" });
        } else {
            return res.status(200).json(updateData);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/groupId/:groupId/userId/:userId", async (req, res) => {
    const { groupId, userId } = req.params;
    const { currentLat, currentLong } = req.query;

    try {
        let rute = await service.getNearestStop(groupId, userId, parseFloat(currentLat), parseFloat(currentLong));
        res.json(rute);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const routeId = req.body.route;

        if (!Array.isArray(routeId) || routeId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty routeId array",
            });
        }

        const numericIds = routeId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${routeId}`);
            }
            return num;
        });

        const result = await BusRoutesModel.deleteMany({
            groupId: groupId,
            routeId: { $in: numericIds },
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
