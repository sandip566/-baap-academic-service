const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/admissioncancel.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const TokenService = require("../services/token.services");
router.post(
    "/",
    checkSchema(require("../dto/admissioncancel.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
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
        const page = parseInt(req.query.pageNumber) || 1;
        const limit = parseInt(req.query.pageSize) || 10;
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

module.exports = router;
