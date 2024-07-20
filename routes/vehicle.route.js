const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/vehicle.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const vehicleModel = require("../schema/vehicle.schema")

router.post(
    "/",
    checkSchema(require("../dto/vehicle.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const { vehicalNo, groupId } = req.body;
        const existingVehicle = await service.findByVehicleNo(groupId, vehicalNo);
        if (existingVehicle) {
            return res.status(400).json({ error: "This vehicleNo is already exists" });
        }

        const vehicleId = +Date.now();
        req.body.vehicleId = vehicleId;
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
    let { vehicleNo, ownerName, phoneNumber, search, page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit);
    const serviceResponse = await service.getAllDataByGroupId(
        groupId, ownerName, vehicleNo, phoneNumber, search, page, limit
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

        const existingVehicle = await service.findVehicleByNoExcludeCurrent(groupId, newData.vehicalNo, vehicleId);
        if (existingVehicle) {
            return res.status(409).json({ error: "Vehicle number already exists" });
        }

        const updateData = await service.updateVehicleById(vehicleId, groupId, newData);
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

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const vehicleId = req.body.vehicle;

        if (!Array.isArray(vehicleId) || vehicleId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty vehicleId array",
            });
        }

        const numericIds = vehicleId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${vehicleId}`);
            }
            return num;
        });

        const result = await vehicleModel.deleteMany({
            groupId: groupId,
            vehicleId: { $in: numericIds },
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
