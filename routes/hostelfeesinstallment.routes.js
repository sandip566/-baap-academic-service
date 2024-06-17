const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/hostelfeesinstallment.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/hostelfeesinstallment.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.delete("/:id", async (req, res) => {
    const serviceResponse = await service.deleteById(req.params.id);

    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.get("/getByInstallmentStatus/hostelInstallmentId/:hostelInstallmentId", async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }
    const serviceResponse = await service.getByInstallmentId(
        req.params.hostelInstallmentId
    );
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

router.get("/all/hostelFeesInstallment", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/getHostelFeesInstallment/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        groupId: req.query.groupId,
        HostelFeesInstallment: req.query.installmentId,
        studentId: req.query.studentId,
        empId: req.query.empId,
        installmentNo: req.query.installmentNo,
        pageNumber: parseInt(req.query.pageNumber) || 1,
    };
    const serviceResponse = await service.getAllHostelFeesInstallmentByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/:id/user/:userId", async (req, res) => {
    const { id, userId } = req.params;
    const serviceResponse = await service.markAsDeletedByUser(id, userId);
    requestResponsehelper.sendResponse(res, serviceResponse);
    
});

router.get("/user/:userId", async (req, res) => {
    const { userId } = req.params;
    const serviceResponse = await service.getNonDeletedForUser(userId);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

module.exports = router;
