const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/attendance.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const TokenService = require("../services/token.services");

router.post(
    "/",
    checkSchema(require("../dto/attendance.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const attendanceId = +Date.now();
        req.body.attendanceId = attendanceId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria(req.query);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete(
    "/:id",
    TokenService.checkPermission(["PATML4"]),
    async (req, res) => {
        const serviceResponse = await service.deleteById(req.params.id);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.put(
    "/:id",
    TokenService.checkPermission(["PATML3"]),
    async (req, res) => {
        const serviceResponse = await service.updateById(
            req.params.id,
            req.body
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/:id", async (req, res) => {
    const serviceResponse = await service.getById(req.params.id);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get(
    "/all/getByGroupId/:groupId",
    TokenService.checkPermission(["PATML1"]),
    async (req, res) => {
        const groupId = req.params.groupId;
        const criteria = {
            name: req.query.name,
            reasonOfLateArrival: req.query.reasonOfLateArrival,
            attendanceId: req.query.attendanceId,
        };
        const serviceResponse = await service.getAllDataByGroupId(
            groupId,
            criteria
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.delete(
    "/groupId/:groupId/attendanceId/:attendanceId",
    TokenService.checkPermission(["PATML4"]),
    async (req, res) => {
        try {
            const attendanceId = req.params.attendanceId;
            const groupId = req.params.groupId;
            const attendanceData = await service.deleteAttendanceById({
                attendanceId: attendanceId,
                groupId: groupId,
            });
            if (!attendanceData) {
                res.status(404).json({
                    error: "attendance data not found to delete",
                });
            } else {
                res.status(201).json(attendanceData);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.put(
    "/groupId/:groupId/attendanceId/:attendanceId",
    TokenService.checkPermission(["PATML3"]),
    async (req, res) => {
        try {
            const attendanceId = req.params.attendanceId;
            const groupId = req.params.groupId;
            const newData = req.body;
            const updateattendance = await service.updateAttendanceById(
                attendanceId,
                groupId,
                newData
            );
            if (!updateattendance) {
                res.status(404).json({
                    error: "attendance data not found to update",
                });
            } else {
                res.status(200).json({
                    updateattendance,
                    message: "data update successfully",
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);
module.exports = router;
