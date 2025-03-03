const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/driver.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const DriverModel = require("../schema/driver.schema");

router.post(
    "/",
    checkSchema(require("../dto/driver.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const { userId, groupId } = req.body;
        const existingUser = await service.findByUserId(groupId, userId);
        if (existingUser) {
            return res.status(400).json({ error: "This user is already exists" });
        }
        const driverId = +Date.now();
        req.body.driverId = driverId
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all/driver", async (req, res) => {
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

router.get("/getdriverId/:driverId", async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }
    const serviceResponse = await service.getBydriverId(req.params.driverId);

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/groupId/:groupId/driverId/:driverId", async (req, res) => {
    try {
        const driverId = req.params.driverId;
        const groupId = req.params.groupId;
        const Data = await service.deleteTripHistroyById({
            driverId: driverId,
            groupId: groupId,
        });
        if (!Data) {
            res.status(404).json({ error: "driver data not found to delete" });
        } else {
            res.status(201).json(Data);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/groupId/:groupId/driverId/:driverId", async (req, res) => {
    try {
        const driverId = req.params.driverId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const updateData = await service.updatedriverById(
            driverId,
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

router.get("/groupId/:groupId/userId/:userId", async (req, res) => {
    try {
        const { groupId, userId } = req.params

        const data = await service.getActiveTripByUserId(groupId, userId)
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const driverId = req.body.driver;

        if (!Array.isArray(driverId) || driverId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty driverId array",
            });
        }

        const numericIds = driverId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${driverId}`);
            }
            return num;
        });

        const result = await DriverModel.deleteMany({
            groupId: groupId,
            driverId: { $in: numericIds },
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
