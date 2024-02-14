const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/busroutes.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/busroutes.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const routeId = +Date.now();
        req.body.routeId = routeId;
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
        pageSize: 10
    };
    const { pageNumber, pageSize, ...query } = req.query;
    const serviceResponse = await service.getAllByCriteria(query,pagination);

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        routeId: req.query.routeId,
        routeName: req.query.routeName,
        schedule: req.query.schedule,
        pageNumber:parseInt(req.query.pageNumber)||1
    };
    const serviceResponse = await service.getAllDataByGroupId(groupId, criteria);
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
        const routeId = req.params.routeId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const updateroute = await service.updateRoute(
            routeId,
            groupId,
            newData
        );
        if (!updateroute) {
            res.status(404).json({
                error: " data not found to update",
            });
        } else {
            res.status(200).json({ updateroute, message: "data update successfully" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
module.exports = router;
