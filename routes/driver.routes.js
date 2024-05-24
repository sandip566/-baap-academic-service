const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/driver.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/driver.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
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
    const query = {
        driverId: req.query.driverId,
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




module.exports = router;
