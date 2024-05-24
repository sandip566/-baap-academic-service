const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/hostelPayment.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const HostelAdmissionModel = require("../schema/hosteladmission.schema");
const HostelFeesInstallmentModel = require("../schema/hostelfeesinstallment.schema");
const hostelfeesinstallmentService = require("../services/hostelfeesinstallment.service");
const hosteladmissionService = require("../services/hosteladmission.service");
const TokenService = require("../services/token.services");


router.post(
    "/",
    checkSchema(require("../dto/feesPayment.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const tolerance = 0.01;
        const hostelAdmissionId = req.body.hostelAdmissionId;
        const feesDetailsId = req.body.feesDetailsId;
        const empId = req.body.empId;
        const installmentDetails = req.body.installment;
        const otherAmount = parseFloat(req.body.other_amount) || 0;

        let totalPaidAmount = 0;

        for (const installment of installmentDetails) {
            if (installment.radio) {
                totalPaidAmount += parseFloat(installment.amount);
            }
        }

        totalPaidAmount += otherAmount;

        const existingRecord = await service.getByAdmissionAndEmpId(
            hostelAdmissionId,
            feesDetailsId,
            empId
        );

        if (existingRecord.data !== null) {
            const hostelPaymentId = +Date.now();
            req.body.hostelPaymentId = hostelPaymentId;
            console.log(totalPaidAmount, existingRecord.data.remainingAmount);
            if (
                totalPaidAmount >
                existingRecord.data.remainingAmount + tolerance
            ) {
                return res
                    .status(400)
                    .json({ error: "You have paid extra amount." });
            }

            let remainingAmount =
                Math.max(
                    existingRecord.data.remainingAmount - totalPaidAmount,
                    0
                ) || 0;

            if (req.body.hostelAdmissionId) {
                const admission = await HostelAdmissionModel.findOneAndUpdate(
                    { hostelAdmissionId: req.body.hostelAdmissionId },
                    { admissionStatus: "Confirm" },
                    { new: true }
                );
                const UpdateinstallmentStatus =
                    await HostelFeesInstallmentModel.findOneAndUpdate(
                        { hostelAdmissionId: req.body.hostelAdmissionId },
                        { admission: "Confirm" },
                        { new: true }
                    );
            }

            const serviceResponse = await service.create(req.body);
            const updateResult = await service.updatePaidAmountInDatabase(
                hostelPaymentId,
                totalPaidAmount,
                remainingAmount
            );

            const installmentRecord =
                await hostelfeesinstallmentService.getByInstallmentId(
                    req.body.hostelInstallmentId
                );
                console.log(installmentRecord);
            const studentInstallmentRecord =
                await hosteladmissionService.getByInstallmentId(
                    req.body.hostelInstallmentId,
                    req.body.hostelAdmissionId
                );
            if (installmentRecord) {
                for (const feesDetail of installmentRecord.data.feesDetails) {
                    for (const installment of feesDetail.installment) {
                        for (const reqInstallment of req.body.installment) {
                            if (
                                installment.installmentNo ===
                                    reqInstallment.installmentNo &&
                                reqInstallment.radio
                            ) {
                                installment.status = "paid";
                            }
                        }
                    }

                    for (const feesDetail of installmentRecord.data
                        .feesDetails) {
                        const allInstallmentsPaid =
                            feesDetail.installment.every(
                                (installment) => installment.status === "paid"
                            );

                        if (allInstallmentsPaid) {
                            installmentRecord.data.status = "paid";
                        } else {
                            installmentRecord.data.status = "pending";
                            break;
                        }
                    }
                }

                await hostelfeesinstallmentService.updateFeesInstallmentById(
                    installmentRecord.data.hostelInstallmentId,
                    installmentRecord.data.feesDetails,
                    installmentRecord.data
                );
                const pendingInstallment =
                    await hostelfeesinstallmentService.getPendingInstallmentByAdmissionId(
                        hostelAdmissionId
                    );

                let otherAmountRemaining = otherAmount;

                pendingInstallment.forEach((pending) => {
                    pending.feesDetails.forEach((feesDetail) => {
                        if (feesDetail.feesDetailsId == feesDetailsId) {
                            feesDetail.installment.some((installment) => {
                                if (installment.status === "pending") {
                                    const amountToDeduct = Math.min(
                                        otherAmountRemaining,
                                        installment.amount
                                    );
                                    installment.amount -= amountToDeduct;
                                    otherAmountRemaining -= amountToDeduct;

                                    if (installment.amount === 0) {
                                        installment.status = "paid";
                                        hostelfeesinstallmentService.updateInstallmentAmount(
                                            installment.installmentNo,
                                            installment.amount,
                                            "paid"
                                        );
                                    } else {
                                        hostelfeesinstallmentService.updateInstallmentAmount(
                                            installment.installmentNo,
                                            installment.amount,
                                            "pending"
                                        );
                                    }

                                    return otherAmountRemaining <= 0;
                                }
                            });
                        }
                    });
                });
            }
            if (studentInstallmentRecord) {
                for (const feesDetail of studentInstallmentRecord.data
                    .feesDetails) {
                    for (const installment of feesDetail.installment) {
                        for (const reqInstallment of req.body.installment) {
                            if (
                                installment.installmentNo ===
                                    reqInstallment.installmentNo &&
                                reqInstallment.radio
                            ) {
                                installment.status = "paid";
                            }
                        }
                    }

                    for (const feesDetail of studentInstallmentRecord.data
                        .feesDetails) {
                        const allInstallmentsPaid =
                            feesDetail.installment.every(
                                (installment) => installment.status === "paid"
                            );

                        if (allInstallmentsPaid) {
                            studentInstallmentRecord.data.status = "paid";
                        } else {
                            studentInstallmentRecord.data.status = "pending";
                            break;
                        }
                    }
                }

                await hosteladmissionService.updateFeesInstallmentById(
                    studentInstallmentRecord.data.hostelInstallmentId,
                    studentInstallmentRecord.data.feesDetails,
                    studentInstallmentRecord.data
                );
                const pendingInstallment =
                    await hosteladmissionService.getPendingInstallmentByAdmissionId(
                        hostelAdmissionId
                    );

                let otherAmountRemaining = otherAmount;

                pendingInstallment.forEach((pending) => {
                    pending.feesDetails.forEach((feesDetail) => {
                        if (feesDetail.feesDetailsId == feesDetailsId) {
                            feesDetail.installment.some((installment) => {
                                if (installment.status === "pending") {
                                    const amountToDeduct = Math.min(
                                        otherAmountRemaining,
                                        installment.amount
                                    );
                                    installment.amount -= amountToDeduct;
                                    otherAmountRemaining -= amountToDeduct;

                                    if (installment.amount === 0) {
                                        installment.status = "paid";
                                        hosteladmissionService.updateInstallmentAmount(
                                            installment.installmentNo,
                                            installment.amount,
                                            "paid"
                                        );
                                    } else {
                                        hosteladmissionService.updateInstallmentAmount(
                                            installment.installmentNo,
                                            installment.amount,
                                            "pending"
                                        );
                                    }
                                    return otherAmountRemaining <= 0;
                                }
                            });
                        }
                    });
                });
            }
            serviceResponse.data.paidAmount = totalPaidAmount;
            serviceResponse.data.remainingAmount = remainingAmount;

            requestResponsehelper.sendResponse(res, serviceResponse);
        } else {
            const hostelPaymentId = +Date.now();
            req.body.hostelPaymentId = hostelPaymentId;

            if (totalPaidAmount > req.body.hostelFee) {
                return res
                    .status(400)
                    .json({ error: "You have paid extra amount." });
            }

            let remainingAmount =
                Math.max(req.body.hostelFee - totalPaidAmount, 0) || 0;
            if (req.body.hostelAdmissionId) {
                const admission = await HostelAdmissionModel.findOneAndUpdate(
                    { hostelAdmissionId: req.body.hostelAdmissionId },
                    { admissionStatus: "Confirm" },
                    { new: true }
                );
                const UpdateinstallmentStatus =
                    await HostelFeesInstallmentModel.findOneAndUpdate(
                        { hostelAdmissionId: req.body.hostelAdmissionId },
                        { admission: "Confirm" },
                        { new: true }
                    );
            }
            const serviceResponse = await service.create(req.body);
            const updateResult = await service.updatePaidAmountInDatabase(
                hostelPaymentId,
                totalPaidAmount,
                remainingAmount
            );

            const installmentRecord =
                await hostelfeesinstallmentService.getByInstallmentId(
                    req.body.hostelInstallmentId
                );
                console.log(installmentRecord);
            const AddmissioninstallmentRecord =
                await hosteladmissionService.getByInstallmentId(
                    req.body.hostelInstallmentId
                );

            if (installmentRecord) {
                for (const feesDetail of installmentRecord.data?.feesDetails) {
                    for (const installment of feesDetail.installment) {
                        for (const reqInstallment of req.body.installment) {
                            if (
                                installment.installmentNo ===
                                    reqInstallment.installmentNo &&
                                reqInstallment.radio
                            ) {
                                installment.status = "paid";
                            }
                        }
                    }
                    for (const feesDetail of installmentRecord.data
                        .feesDetails) {
                        const allInstallmentsPaid =
                            feesDetail.installment.every(
                                (installment) => installment.status === "paid"
                            );

                        if (allInstallmentsPaid) {
                            installmentRecord.data.status = "paid";
                        } else {
                            installmentRecord.data.status = "pending";
                            break;
                        }
                    }
                }

                await hostelfeesinstallmentService.updateFeesInstallmentById(
                    installmentRecord.data.hostelInstallmentId,
                    installmentRecord.data.feesDetails,
                    installmentRecord.data
                );
                const pendingInstallment =
                    await hostelfeesinstallmentService.getPendingInstallmentByAdmissionId(
                        hostelAdmissionId
                    );

                let otherAmountRemaining = otherAmount;

                pendingInstallment.forEach((pending) => {
                    pending.feesDetails.forEach((feesDetail) => {
                        if (feesDetail.feesDetailsId == feesDetailsId) {
                            feesDetail.installment.some((installment) => {
                                if (installment.status === "pending") {
                                    const amountToDeduct = Math.min(
                                        otherAmountRemaining,
                                        installment.amount
                                    );
                                    installment.amount -= amountToDeduct;
                                    otherAmountRemaining -= amountToDeduct;

                                    if (installment.amount === 0) {
                                        installment.status = "paid";
                                        hostelfeesinstallmentService.updateInstallmentAmount(
                                            installment.installmentNo,
                                            installment.amount,
                                            "paid"
                                        );
                                    } else {
                                        hostelfeesinstallmentService.updateInstallmentAmount(
                                            installment.installmentNo,
                                            installment.amount,
                                            "pending"
                                        );
                                    }

                                    return otherAmountRemaining <= 0;
                                }
                            });
                        }
                    });
                });
            }
            //studentAddmission
            if (AddmissioninstallmentRecord) {
                for (const feesDetail of AddmissioninstallmentRecord.data
                    .feesDetails) {
                    for (const installment of feesDetail.installment) {
                        for (const reqInstallment of req.body.installment) {
                            if (
                                installment.installmentNo ===
                                    reqInstallment.installmentNo &&
                                reqInstallment.radio
                            ) {
                                installment.status = "paid";
                            }
                        }
                    }
                    for (const feesDetail of AddmissioninstallmentRecord.data
                        .feesDetails) {
                        const allInstallmentsPaid =
                            feesDetail.installment.every(
                                (installment) => installment.status === "paid"
                            );

                        if (allInstallmentsPaid) {
                            AddmissioninstallmentRecord.data.status = "paid";
                        } else {
                            AddmissioninstallmentRecord.data.status = "pending";
                            break;
                        }
                    }
                }

                await hosteladmissionService.updateFeesInstallmentById(
                    AddmissioninstallmentRecord.data.hostelInstallmentId,
                    AddmissioninstallmentRecord.data.feesDetails,
                    AddmissioninstallmentRecord.data
                );
                const pendingInstallment =
                    await hosteladmissionService.getPendingInstallmentByAdmissionId(
                        hostelAdmissionId
                    );

                let otherAmountRemaining = otherAmount;

                pendingInstallment.forEach((pending) => {
                    pending.feesDetails.forEach((feesDetail) => {
                        if (feesDetail.feesDetailsId == feesDetailsId) {
                            feesDetail.installment.some((installment) => {
                                if (installment.status === "pending") {
                                    const amountToDeduct = Math.min(
                                        otherAmountRemaining,
                                        installment.amount
                                    );
                                    installment.amount -= amountToDeduct;
                                    otherAmountRemaining -= amountToDeduct;

                                    if (installment.amount === 0) {
                                        installment.status = "paid";
                                        hosteladmissionService.updateInstallmentAmount(
                                            installment.installmentNo,
                                            installment.amount,
                                            "paid"
                                        );
                                    } else {
                                        hosteladmissionService.updateInstallmentAmount(
                                            installment.installmentNo,
                                            installment.amount,
                                            "pending"
                                        );
                                    }
                                    return otherAmountRemaining <= 0;
                                }
                            });
                        }
                    });
                });
            }
            serviceResponse.data.paidAmount = totalPaidAmount;
            serviceResponse.data.remainingAmount = remainingAmount;

            requestResponsehelper.sendResponse(res, serviceResponse);
        }
    }
);
router.get(
    "/getHostelStatastics/:groupId",
    // TokenService.checkPermission(["EFCL1"]),
    async (req, res, next) => {
        const groupId = req.params.groupId;
        const criteria = {
            currentDate: req.query.currentDate,
            academicYear: req.query.academicYear,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            location: req.query.location,
            course: req.query.course,
            class: req.query.class,
            department: req.query.department,
            feesTemplateId: req.query.feesTemplateId,
            division: req.query.division,
            month: req.query.month,
            search: req.query.search,
        };
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 500;
        const serviceResponse = await service.getHostelStatastics(
            groupId,
            criteria,
            page,
            limit
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
router.get(
    "/getFeesTotalCount/:groupId",
    // TokenService.checkPermission(["EFCL1"]),
    async (req, res, next) => {
        const groupId = req.params.groupId;
        const criteria = {
            currentDate: req.query.currentDate,
            academicYear: req.query.academicYear,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            location: req.query.location,
            course: req.query.course,
            class: req.query.class,
            department: req.query.department,
            feesTemplateId: req.query.feesTemplateId,
            division: req.query.division,
            month: req.query.month,
            search: req.query.search,
        };

        const serviceResponse = await service.getFeesTotalCount(
            groupId,
            criteria
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
router.get("/all", async (req, res) => {
    const pagination = {
        pageNumber: req.query.pageNumber || 1,
        pageSize: 10,
    };
    const { pageNumber, pageSize, ...query } = req.query;
    const serviceResponse = await service.getAllByCriteria({
        req,
        query,
        pagination,
    });
    requestResponsehelper.sendResponse(res, serviceResponse);
});

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

router.get("/getAllupdateHostelPayment/groupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        hostelPaymentId: req.query.hostelPaymentId,
        studentId: req.query.studentId,
        mmemberId: req.query.memberId,
        hostelId: req.query.hostelId,
        pageNumber: parseInt(req.query.pageNumber) || 1,
    };
    const serviceResponse = await service.getAllHostelPaymentByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete(
    "/groupId/:groupId/hostelPaymentId/:hostelPaymentId",
    async (req, res) => {
        try {
            const hostelPaymentId = req.params.hostelPaymentId;
            const groupId = req.params.groupId;
            const deleteHostelPaymnet = await service.deleteHostelPaymentId({
                hostelPaymentId: hostelPaymentId,
                groupId: groupId,
            });
            if (!deleteHostelPaymnet) {
                res.status(404).json({
                    error: "HostelPaymnet data not found to delete",
                });
            } else {
                res.status(201).json(deleteHostelPaymnet);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.put(
    "/groupId/:groupId/hostelPaymentId/:hostelPaymentId",
    async (req, res) => {
        try {
            const hostelPaymentId = req.params.hostelPaymentId;
            const groupId = req.params.groupId;
            const newData = req.body;
            const updateHostelPaymnet = await service.updateHostelPaymentById(
                hostelPaymentId,
                groupId,
                newData
            );
            if (!updateHostelPaymnet) {
                res.status(404).json({
                    error: "HostelPaymnet data not found to update",
                });
            } else {
                res.status(200).json(updateHostelPaymnet);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);
module.exports = router;
