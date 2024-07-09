const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/activetrips.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/activetrips.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const tripId = +Date.now();
        req.body.tripId = tripId
        const { groupId, routeId, driverId, careTakerId } = req.body

        const checkActive = await service.checkActiveTrip(groupId, routeId, driverId, careTakerId)
        if (checkActive) {
            res.status(500).send({ messege: "already trip is active for route" })
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

router.get("/all/activeTrips", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/getTripId/:tripId", async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }
    const serviceResponse = await service.getBytripId(req.params.tripId);

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const criteria = {
            tripId: req.query.tripId,
            userId: req.query.userId,
            routeId: req.query.routeId,
            vehicleId: req.query.vehicleId,
            driverId: req.query.driverId,
            careTakerId: req.query.careTakerId,
            page: req.query.page,
            limit: req.query.limit
        };

        const serviceResponse = await service.getAllDataByGroupId(groupId, criteria);
        res.status(200).json(serviceResponse);
    } catch (error) {
        console.error("Error in fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.delete("/groupId/:groupId/tripId/:tripId", async (req, res) => {
    try {
        const tripId = req.params.tripId;
        const groupId = req.params.groupId;
        const Data = await service.deleteTripHistroyById({
            tripId: tripId,
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

router.put("/groupId/:groupId/tripId/:tripId", async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const tripId = req.params.tripId;
        const newData = req.body;

        const updateData = await service.updateActiveTrip(groupId, tripId, newData);

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

router.get("/groupId/:groupId/tripId/:tripId", async (req, res) => {
    try {
        const { groupId, tripId } = req.params;
        const { lat, long } = req.query
        const trip = await service.getActiveTrip(groupId, tripId, lat, long)
        res.json(trip)
    } catch (error) {
        console.log("erroe masseg", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

router.get("/groupId/:groupId", async (req, res) => {
    try {
        const { groupId } = req.params;
        const { status, page, limit } = req.query;
        const pageNumber = parseInt(page, 10) || 1;
        const pageSize = parseInt(limit, 10) || 10;
        const trip = await service.getActiveTripByStatus(groupId, status, pageNumber, pageSize);

        res.json(trip);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.get("/trip/groupId/:groupId/:tripId", async (req, res) => {
    try {
        const { groupId, tripId } = req.params;
        const { travellerId } = req.query;
        const trip = await service.getTrip(groupId, tripId, travellerId);
        res.json(trip);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/groupId/:groupId/userId/:userId", async (req, res) => {
    try {
        const { groupId, userId } = req.params;

        const trip = await service.getActiveTripsWithTravelerData(groupId, userId);
        res.json(trip);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
