const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/vehicle.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/vehicle.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const vehicleId = +Date.now();
        req.body.vehicleId = vehicleId
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all/vehicle", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/getVehicleId/:vehicleId", async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }
    const serviceResponse = await service.getByvehicleId(req.params.vehicleId);

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const query = {
        vehicleId: req.query.vehicleId,
        driverName: req.query.driverName,
        phoneNumber: req.query.phoneNumber,
    };
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        query,
        page,
        limit
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/groupId/:groupId/vehicleId/:vehicleId", async (req, res) => {
    try {
        const vehicleId = req.params.vehicleId;
        const groupId = req.params.groupId;
        const Data = await service.deleteTripHistroyById({
            vehicleId: vehicleId,
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

router.put("/groupId/:groupId/vehicleId/:vehicleId", async (req, res) => {
    try {
        const vehicleId = req.params.vehicleId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const updateData = await service.updatevehicleById(
            vehicleId,
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
