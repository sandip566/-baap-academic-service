const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/feesPayment.services");
const Service = require("../services/feesInstallment.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const feesInstallmentService = require("../services/feesInstallment.services");

// router.post(
//   "/",
//   checkSchema(require("../dto/feesPayment.dto")),
//   async (req, res, next) => {
//     if (ValidationHelper.requestValidationErrors(req, res)) {
//       return;
//     }
//     const feesPaymentId = +Date.now();
//     req.body.feesPaymentId = feesPaymentId;
//     const installmentId = req.body.installmentId;
//     const updateResult = await feesInstallmentService.updateInstallmentAsPaid(installmentId);
//     const serviceResponse = await service.create(req.body, updateResult);
//     requestResponsehelper.sendResponse(res, serviceResponse);
//   }
// );
router.post(
    "/",
    checkSchema(require("../dto/feesPayment.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }

        const feesPaymentId = +Date.now();
        req.body.feesPaymentId = feesPaymentId;

        const installmentDetails = req.body.installment;
        const otherAmount = parseFloat(req.body.other_amount) || 0;

        let totalPaidAmount = 0;

        for (const installment of installmentDetails) {
            if (installment.radio) {
                totalPaidAmount += parseFloat(installment.amount);
            }
        }
        totalPaidAmount += otherAmount;
        console.log(totalPaidAmount);

        let remainingAmount = req.body.courseFee - totalPaidAmount || 0;

        const serviceResponse = await service.create(req.body);

        let a = await service.updatePaidAmountInDatabase(
            feesPaymentId,
            totalPaidAmount,
            remainingAmount
        );
        console.log(a);

        serviceResponse.data.paidAmount = totalPaidAmount;
        serviceResponse.data.remainingAmount = remainingAmount;

        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
router.get("/getRecoveryData/:groupId", async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const serviceResponse = await service.getRecoveryData(
        req.params.groupId,
        skip,
        limit
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.get("/getFeesStatData/:groupId", async (req, res, next) => {
    const groupId = req.params.groupId;
    const criteria = {
        currentDate: req.query.currentDate,
        academicYear: req.query.academicYear,
        location: req.query.location,
        course: req.query.course,
        class: req.query.class,
        division: req.query.division,
        pageNumber: parseInt(req.query.pageNumber) || 1,
    };
    const serviceResponse = await service.getFeesStatData(groupId, criteria);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/all", async (req, res) => {
    const pagination = {
        pageNumber: req.query.pageNumber || 1,
        pageSize: 10,
    };
    const { pageNumber, pageSize, ...query } = req.query;
    const serviceResponse = await service.getAllByCriteria(query, pagination);
    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.get(
    "/getByfeesPaymentId/groupId/:groupId/feesPaymentId/:feesPaymentId",
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const serviceResponse = await service.getByfeesPaymentId(
            req.params.groupId,
            req.params.feesPaymentId
        );
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

router.get("/getAllFeesPayment/groupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        feesPaymentId: req.query.feesPaymentId,
        empId: req.query.empId,
        userId: req.query.userId,
        installmentId: req.query.installmentId,
    };
    const serviceResponse = await service.getAllFeesPaymentByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete(
    "/groupId/:groupId/feesPaymentId/:feesPaymentId",
    async (req, res) => {
        try {
            const feesPaymentId = req.params.feesPaymentId;
            const groupId = req.params.groupId;
            const feesPaymentData = await service.deleteFeesPaymentById({
                feesPaymentId: feesPaymentId,
                groupId: groupId,
            });
            if (!feesPaymentData) {
                res.status(404).json({
                    error: "feesPayment data not found to delete",
                });
            } else {
                res.status(201).json(feesPaymentData);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.put(
    "/groupId/:groupId/feesPaymentId/:feesPaymentId",
    async (req, res) => {
        try {
            const feesPaymentId = req.params.feesPaymentId;
            const groupId = req.params.groupId;
            const newData = req.body;
            const updatefeesPaymentId = await service.updateFeesPaymentById(
                feesPaymentId,
                groupId,
                newData
            );
            if (!updatefeesPaymentId) {
                res.status(404).json({
                    error: "updatefeesPaymentId data not found to update",
                });
            } else {
                res.status(200).json(updatefeesPaymentId);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.get("/fees-summary/:studentId", async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const installments = await Service.getInstallmentsByStudentId(
            studentId
        );
        const paymentsResponse = await service.getAllFeesPaymentByStudentId(
            studentId,
            {}
        );
        const payments = paymentsResponse.data.items;
        if (!Array.isArray(payments)) {
            console.error("Error: Payments is not an array");
            return res.status(500).json({ error: "Internal Server Error" });
        }
        const feesSummary = {
            studentId,
            totalFee: 0,
            totalPaidAmount: 0,
            remainingAmount: 0,
            installmentDetails: [],
        };
        for (const installment of installments) {
            feesSummary.totalFee += installment.installmentAmount;
            const paidAmountForInstallment = payments
                .filter((payment) => {
                    if (
                        payment &&
                        payment.installmentId &&
                        payment.installmentId._id
                    ) {
                        return payment.installmentId._id.equals(
                            installment._id
                        );
                    } else {
                        console.error(
                            "payment, payment.installmentId, or payment.installmentId._id is null or undefined."
                        );
                        return false;
                    }
                })
                .reduce((total, payment) => total + payment.paidAmount, 0);
            const remainingAmountForInstallment =
                installment.installmentAmount - paidAmountForInstallment;
            feesSummary.totalPaidAmount += paidAmountForInstallment;
            feesSummary.remainingAmount += remainingAmountForInstallment;
            const installmentDetails = {
                installmentId: installment._id,
                installmentNumber: installment.installmentNo,
                reciptNo: installment.reciptNo,
                installmentAmount: installment.installmentAmount,
                paidAmount: paidAmountForInstallment,
                remainingAmount: remainingAmountForInstallment,
                dueDate: installment.dueDate,
                isPaid: remainingAmountForInstallment === 0,
            };
            feesSummary.installmentDetails.push(installmentDetails);
        }
        res.json(feesSummary);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
module.exports = router;
