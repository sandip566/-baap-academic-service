const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/feesPayment.services");
const Service = require("../services/feesInstallment.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const feesInstallmentService = require("../services/feesInstallment.services");
const feesTemplateModel = require("../schema/feesTemplate.schema");
const studentAdmissionServices = require("../services/studentAdmission.services");
const StudentsAdmissionModel = require("../schema/studentAdmission.schema");
const FeesInstallmentModel = require("../schema/feesInstallment.schema");
const TokenService = require("../services/token.services");
const feesPaymnetModel = require("../services/feesPayment.services");
router.post(
    "/",
    checkSchema(require("../dto/feesPayment.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const tolerance = 0.01;
        const addmissionId = req.body.addmissionId;
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
            addmissionId,
            feesDetailsId,
            empId
        );

        if (existingRecord.data !== null) {
            const feesPaymentId = +Date.now();
            req.body.feesPaymentId = feesPaymentId;
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

            if (req.body.addmissionId) {
                const admission = await StudentsAdmissionModel.findOneAndUpdate(
                    { addmissionId: req.body.addmissionId },
                    { admissionStatus: "Confirm" },
                    { new: true }
                );
                const UpdateinstallmentStatus =
                    await FeesInstallmentModel.findOneAndUpdate(
                        { addmissionId: req.body.addmissionId },
                        { admission: "Confirm" },
                        { new: true }
                    );
            }

            const serviceResponse = await service.create(req.body);
            const updateResult = await service.updatePaidAmountInDatabase(
                feesPaymentId,
                totalPaidAmount,
                remainingAmount
            );

            const installmentRecord =
                await feesInstallmentService.getByInstallmentId(
                    req.body.installmentId
                );
            const studentInstallmentRecord =
                await studentAdmissionServices.getByInstallmentId(
                    req.body.installmentId,
                    req.body.addmissionId
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

                await feesInstallmentService.updateFeesInstallmentById(
                    installmentRecord.data.installmentId,
                    installmentRecord.data.feesDetails,
                    installmentRecord.data
                );
                const pendingInstallment =
                    await feesInstallmentService.getPendingInstallmentByAdmissionId(
                        addmissionId
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
                                        feesInstallmentService.updateInstallmentAmount(
                                            installment.installmentNo,
                                            installment.amount,
                                            "paid"
                                        );
                                    } else {
                                        feesInstallmentService.updateInstallmentAmount(
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

                await studentAdmissionServices.updateFeesInstallmentById(
                    studentInstallmentRecord.data.installmentId,
                    studentInstallmentRecord.data.feesDetails,
                    studentInstallmentRecord.data
                );
                const pendingInstallment =
                    await studentAdmissionServices.getPendingInstallmentByAdmissionId(
                        addmissionId
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
                                        studentAdmissionServices.updateInstallmentAmount(
                                            installment.installmentNo,
                                            installment.amount,
                                            "paid"
                                        );
                                    } else {
                                        studentAdmissionServices.updateInstallmentAmount(
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
            const feesPaymentId = +Date.now();
            req.body.feesPaymentId = feesPaymentId;

            if (totalPaidAmount > req.body.courseFee) {
                return res
                    .status(400)
                    .json({ error: "You have paid extra amount." });
            }

            let remainingAmount =
                Math.max(req.body.courseFee - totalPaidAmount, 0) || 0;
            if (req.body.addmissionId) {
                const admission = await StudentsAdmissionModel.findOneAndUpdate(
                    { addmissionId: req.body.addmissionId },
                    { admissionStatus: "Confirm" },
                    { new: true }
                );
                const UpdateinstallmentStatus =
                    await FeesInstallmentModel.findOneAndUpdate(
                        { addmissionId: req.body.addmissionId },
                        { admission: "Confirm" },
                        { new: true }
                    );
            }
            const serviceResponse = await service.create(req.body);
            const updateResult = await service.updatePaidAmountInDatabase(
                feesPaymentId,
                totalPaidAmount,
                remainingAmount
            );

            const installmentRecord =
                await feesInstallmentService.getByInstallmentId(
                    req.body.installmentId
                );
            const AddmissioninstallmentRecord =
                await studentAdmissionServices.getByInstallmentId(
                    req.body.installmentId
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

                await feesInstallmentService.updateFeesInstallmentById(
                    installmentRecord.data.installmentId,
                    installmentRecord.data.feesDetails,
                    installmentRecord.data
                );
                const pendingInstallment =
                    await feesInstallmentService.getPendingInstallmentByAdmissionId(
                        addmissionId
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
                                        feesInstallmentService.updateInstallmentAmount(
                                            installment.installmentNo,
                                            installment.amount,
                                            "paid"
                                        );
                                    } else {
                                        feesInstallmentService.updateInstallmentAmount(
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

                await studentAdmissionServices.updateFeesInstallmentById(
                    AddmissioninstallmentRecord.data.installmentId,
                    AddmissioninstallmentRecord.data.feesDetails,
                    AddmissioninstallmentRecord.data
                );
                const pendingInstallment =
                    await studentAdmissionServices.getPendingInstallmentByAdmissionId(
                        addmissionId
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
                                        studentAdmissionServices.updateInstallmentAmount(
                                            installment.installmentNo,
                                            installment.amount,
                                            "paid"
                                        );
                                    } else {
                                        studentAdmissionServices.updateInstallmentAmount(
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
    "/getRecoveryData/:groupId",
    // TokenService.checkPermission(["EFCL1"]),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const serviceResponse = await service.getRecoveryData(
            req.params.groupId,
            req.query.academicYear,
            skip,
            limit,
            page
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
router.get(
    "/getRecoveryCount/:groupId",
    TokenService.checkPermission(["EFCL1"]),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        // const page = parseInt(req.query.page) || 1;
        // const limit = parseInt(req.query.limit) || 10;
        // const skip = (page - 1) * limit;
        const serviceResponse = await service.getRecoveryCount(
            req.params.groupId,
            req.query.academicYear
            // skip,
            // limit,
            // page
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
router.get(
    "/getFeesStatData/:groupId",
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
        const serviceResponse = await service.getFeesStatData(
            groupId,
            criteria,
            page,
            limit
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
router.get(
    "/getDenationFeesList/:groupId",
    TokenService.checkPermission(["EFCL1"]),
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
        const serviceResponse = await service.getFeesStatWithDonationData(
            groupId,
            criteria,
            page,
            limit
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
router.get(
    "/getFeesDefaulter/:groupId",
    TokenService.checkPermission(["EFCL1"]),
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
        const serviceResponse = await service.getFeesDefaulter(
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
router.get(
    "/getDonationFeesListCount/:groupId",
    TokenService.checkPermission(["EFCL1"]),
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

        const serviceResponse = await service.getDonationFeesListCount(
            groupId,
            criteria
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
router.get("/all", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});
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

router.get(
    "/getAllFeesPayment/groupId/:groupId",

    async (req, res) => {
        const groupId = req.params.groupId;
        const criteria = {
            feesPaymentId: req.query.feesPaymentId,
            empId: req.query.empId,
            userId: req.query.userId,
            installmentId: req.query.installmentId,
            search: req.query.search,
        };
        const serviceResponse = await service.getAllFeesPaymentByGroupId(
            groupId,
            criteria
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.delete(
    "/groupId/:groupId/feesPaymentId/:feesPaymentId",
    TokenService.checkPermission(["EFCDD4"]),
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

router.get("/studentClearansDetails/:groupId", async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const addmissionId = req.query.addmissionId;
        if (!addmissionId) {
            return res
                .status(400)
                .json({ error: "Missing required parameter: addmissionId" });
        }
        const serviceResponse = await service.calculateTotalFeeAndRemaining(
            groupId,
            addmissionId
        );
        res.json(serviceResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/feesDetails/groupId/:groupId/userId/:userId", async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const userId = req.params.userId;
        const classNames = await feesPaymnetModel.getClassNames(
            groupId,
            userId
        );
        let classPaymentDetails = [];
        let totalAmountAllClasses = 0;
        let totalPaidAmountAllClasses = 0;
        for (const className of classNames) {
            let paidAmt = await feesPaymnetModel.getPaymentDetails(
                groupId,
                userId,
                className
            );
            let totalAmount = 0;
            let totalPaidAmount = 0;

            if (paidAmt && paidAmt.length > 0) {
                paidAmt.forEach((item) => {
                    totalAmount += parseInt(item.courseFee);
                    totalPaidAmount += parseInt(item.paidAmount);
                });
            }
            totalAmountAllClasses += totalAmount;
            totalPaidAmountAllClasses += totalPaidAmount;
            let remainingAmount = totalAmount - totalPaidAmount;
            const classDetails = {
                paidAmount: paidAmt,
                className: className,
                totalAmount: totalAmount,
                PaidAmount: totalPaidAmount,
                remainingAmount: remainingAmount,
            };

            classPaymentDetails.push(classDetails);
        }
        const response = {
            classPaymentDetails: classPaymentDetails,
            totalAmountAllClasses: totalAmountAllClasses,
            totalPaidAmountAllClasses: totalPaidAmountAllClasses,
            remainingAmountAllClasses:
                totalAmountAllClasses - totalPaidAmountAllClasses,
        };
        res.json({
            status: "Success",
            data: {
                userId: userId,
                amountDetails: response,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
