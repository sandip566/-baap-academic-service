const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/driverroutes.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const DriverRoutesModel = require("../schema/driverroutes.schema");

router.post(
    "/",
    checkSchema(require("../dto/driverroutes.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        driverRouteId = +Date.now();
        req.body.driverRouteId = driverRouteId;
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

router.get("/all/driverRoutes", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});

    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.get(
    "/groupId/:groupId/driverRouteId/:driverRouteId",
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const serviceResponse = await service.getByBusRouteId(
            req.params.groupId,
            req.params.driverRouteId
        );

        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const driverRouteId = req.body.driverRoute;

        if (!Array.isArray(driverRouteId) || driverRouteId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty driverRouteId array",
            });
        }

        const numericIds = driverRouteId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${driverRouteId}`);
            }
            return num;
        });

        const result = await DriverRoutesModel.deleteMany({
            groupId: groupId,
            driverRouteId: { $in: numericIds },
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
