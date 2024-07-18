const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/admissioncancel.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const TokenService = require("../services/token.services");
const admissionCancelModel=require("../schema/admissioncancel.schema")
router.post(
    "/",
    checkSchema(require("../dto/admissioncancel.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const existingRecord = await service.getByCourseIdAndGroupId(
            req.body.groupId,
            req.body.addmissionId
        );
        console.log(existingRecord);
        if (existingRecord.data) {
            return res
                .status(409)
                .json({ error: "This Admission Is Already Canceled" });
        }
        const admissionCancelId = +Date.now();
        req.body.admissionCancelId = admissionCancelId;
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
    TokenService.checkPermission(["EMA1"]),
    async (req, res) => {
        const groupId = req.params.groupId;
        const criteria = {
            name: req.query.name,
            status: req.query.status
        };
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const serviceResponse = await service.getAllDataByGroupId(
            groupId,
            criteria,
            page,
            limit
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
router.put('/updateStatus/groupId/:groupId/admissionId/:addmissionId/', async (req, res) => {
    const { groupId,addmissionId } = req.params;
    try {
      const result = await service.updateAdmissionStatus( groupId,addmissionId );
      res.json({ success: true, message: 'Admission status updated successfully', result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update admission status', error: error.message });
    }
  });
router.get("/all", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const admissionCancelId = req.body.admissionCancel;

        if (!Array.isArray(admissionCancelId) || admissionCancelId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty admissionCancelId array",
            });
        }

        const numericIds = admissionCancelId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${admissionCancelId}`);
            }
            return num;
        });

        const result = await admissionCancelModel.deleteMany({
            groupId: groupId,
            admissionCancelId: { $in: numericIds },
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
