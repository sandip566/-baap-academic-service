const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/bus.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const BusModel = require("../schema/bus.schema");

router.post(
    "/",
    checkSchema(require("../dto/bus.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const busId=+Date.now();
        req.body.busId=busId
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all/bus", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});

    requestResponsehelper.sendResponse(res, serviceResponse);
});


router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        busId: req.query.busId,
      
    };
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/groupId/:groupId/busId/:busId", async (req, res) => {
    try {
        const busId = req.params.busId;
        const groupId = req.params.groupId;
        const Data = await service.deleteTripHistroyById({
            busId: busId,
            groupId: groupId,
        });
        if (!Data) {
            res.status(404).json({ error: "bus data not found to delete" });
        } else {
            res.status(201).json(Data);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/groupId/:groupId/busId/:busId", async (req, res) => {
    try {
        const busId = req.params.busId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const updateData = await service.updatebusById(
            busId,
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

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const busId = req.body.bus;

        if (!Array.isArray(busId) || busId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty busId array",
            });
        }

        const numericIds = busId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${busId}`);
            }
            return num;
        });

        const result = await BusModel.deleteMany({
            groupId: groupId,
            busId: { $in: numericIds },
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
