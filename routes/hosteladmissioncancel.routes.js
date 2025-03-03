const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/hosteladmissioncancel.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const TokenService = require("../services/token.services");
const HostelAdmissionModel = require("../schema/hosteladmissioncancel.schema");


router.post(
    "/",
    checkSchema(require("../dto/hosteladmissioncancel.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const existingRecord = await service.getByCourseIdAndGroupId(
            req.body.groupId,
            req.body.hostelAdmissionId
        );
        console.log(existingRecord);
        if (existingRecord.data) {
            return res
                .status(409)
                .json({ error: "This Admission Is Already Canceled" });
        }
        const hostelAdmissionCancelId = +Date.now();
        req.body.hostelAdmissionCancelId = hostelAdmissionCancelId;
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
router.get(
    "/all/getByGroupId/:groupId",
   // TokenService.checkPermission(["EMA1"]),
    async (req, res) => {
        const groupId = req.params.groupId;
        const criteria = {
            name: req.query.name,
            status: req.query.status,
            search: req.query.search,
            page: req.query.page,
            limit: req.query.limit
        };

        const serviceResponse = await service.getAllDataByGroupId(
            groupId,
            criteria,
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
router.put('/updateStatus/groupId/:groupId/admissionId/:addmissionId/', async (req, res) => {
    const { groupId, addmissionId } = req.params;
    try {
        const result = await service.updateAdmissionStatus(groupId, addmissionId);
        res.json({ success: true, message: 'Admission status updated successfully', result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update admission status', error: error.message });
    }
});
router.get("/all/hostelAdmissionCancel", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const hostelAdmissionCancelId = req.body.hostelAdmissionCancel;

        if (!Array.isArray(hostelAdmissionCancelId) || hostelAdmissionCancelId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty hostelAdmissionCancelId array",
            });
        }

        const numericIds = hostelAdmissionCancelId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${hostelAdmissionCancelId}`);
            }
            return num;
        });

        const result = await HostelAdmissionModel.deleteMany({
            groupId: groupId,
            hostelAdmissionCancelId: { $in: numericIds },
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
