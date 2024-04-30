const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/triphistory.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/triphistory.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const tripHistoryId=+Date.now();
        req.body.tripHistoryId=tripHistoryId
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all/TripHistory", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});

    requestResponsehelper.sendResponse(res, serviceResponse);
});


router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        tripHistoryId: req.query.tripHistoryId,
      
    };
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/groupId/:groupId/tripHistoryId/:tripHistoryId", async (req, res) => {
    try {
        const tripHistoryId = req.params.tripHistoryId;
        const groupId = req.params.groupId;
        const Data = await service.deleteTripHistroyById({
            tripHistoryId: tripHistoryId,
            groupId: groupId,
        });
        if (!Data) {
            res.status(404).json({ error: "tripHistory data not found to delete" });
        } else {
            res.status(201).json(Data);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/groupId/:groupId/tripHistoryId/:tripHistoryId", async (req, res) => {
    try {
        const tripHistoryId = req.params.tripHistoryId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const updateData = await service.updateTripHistoryById(
            tripHistoryId,
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
