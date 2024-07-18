const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/hostelfeesinstallment.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const hostelFeesInstallmentModel = require("../schema/hostelfeesinstallment.schema")

router.post(
    "/",
    checkSchema(require("../dto/hostelfeesinstallment.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const hostelInstallmentId = +Date.now();
        req.body.hostelInstallmentId = hostelInstallmentId

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
    const criteria = {
        isActive: true,
        pageSize: parseInt(req.query.pageSize) || 10,
        pageNumber: parseInt(req.query.pageNumber) || 1,
    };

    const serviceResponse = await service.getAllByCriteria(criteria);
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

router.put("/update/:hostelInstallmentId/:groupId", async (req, res) => {
    const { hostelInstallmentId, groupId } = req.params;
    const updateData = req.body;

    try {
        const serviceResponse = await service.updateFeesInstallmentById(hostelInstallmentId, groupId, updateData);
        requestResponsehelper.sendResponse(res, serviceResponse);
    } catch (error) {
        res.status(500).send({ isError: true, message: error.message });
    }
});

router.put("/statusFlag/:hostelInstallmentId", async (req, res) => {
    const { hostelInstallmentId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
        return res.status(400).send({ isError: true, message: 'Invalid isActive value' });
    }

    const serviceResponse = await service.updateStatusFlagByInstallmentId(hostelInstallmentId, isActive);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const hostelInstallmentId = req.body.hostelInstallment;

        if (!Array.isArray(hostelInstallmentId) || hostelInstallmentId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty hostelInstallmentId array",
            });
        }

        const numericIds = hostelInstallmentId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${hostelInstallmentId}`);
            }
            return num;
        });

        const result = await hostelFeesInstallmentModel.deleteMany({
            groupId: groupId,
            hostelInstallmentId: { $in: numericIds },
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
