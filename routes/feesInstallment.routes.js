const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/feesInstallment.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const { MongoClient, Long } = require("mongodb");
const coursesService = require("../services/courses.service");
const FeesInstallmentModel = require("../schema/feesInstallment.schema");
const mongoURI = "mongodb://127.0.0.1:27017/baap-acadamic-dev";
const FeesTemplateModel = require("../schema/feesTemplate.schema");
const { Aggregate, match, project, sum } = require("mongoose").Aggregate;
const feesPaymentModel = require("../services/feesPayment.services")
let totalAmount = 0;
let collectedAmount = 0;

let receiptCounter = 1;
function generateReceiptNumber() {
    const sequentialPart = receiptCounter++;
    return `${sequentialPart.toString().padStart(0, "0")}`;
}

let installmentCounter = 1;
function generateInstallmentNumber() {
    const sequentialPart = installmentCounter++;
    return `${sequentialPart.toString().padStart(0, "0")}`;
}

router.post(
    "/",
    checkSchema(require("../dto/feesInstallment.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const installmentId = +Date.now();
        req.body.installmentId = installmentId;
        req.body.reciptNo = generateReceiptNumber();
        req.body.installmentNo = generateInstallmentNumber();
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/getByInstallmentId/:installmentId", async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }
    const serviceResponse = await service.getByInstallmentId(
        req.params.installmentId
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.get("/getByInstallmentStatus/:installmentId", async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }
    const serviceResponse = await service.getByInstallmentStatus(
        req.params.installmentId
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});
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

router.get("/getFeesInstallment/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        groupId: req.query.groupId,
        installmentId: req.query.installmentId,
        studentId: req.query.studentId,
        empId: req.query.empId,
        installmentNo: req.query.installmentNo,
        pageNumber: parseInt(req.query.pageNumber) || 1,
    };
    const serviceResponse = await service.getAllFeesInstallmentByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete(
    "/groupId/:groupId/installmentId/:installmentId",
    async (req, res) => {
        try {
            const installmentId = req.params.installmentId;
            const groupId = req.params.groupId;
            const feesInstallmentData = await service.deleteFeesInstallmentById(
                { installmentId: installmentId, groupId: groupId }
            );
            if (!feesInstallmentData) {
                res.status(404).json({
                    error: "fees data not found to delete",
                });
            } else {
                res.status(201).json(feesInstallmentData);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.put(
    "/groupId/:groupId/installmentId/:installmentId",
    async (req, res) => {
        try {
            const installmentId = req.params.installmentId;
            const groupId = req.params.groupId;
            const newData = req.body;
            const updateFeesInstallment =
                await service.updateFeesInstallmentById(
                    installmentId,
                    groupId,
                    newData
                );
            if (!updateFeesInstallment) {
                res.status(404).json({
                    error: "FeesInstallment data not found to update",
                });
            } else {
                res.status(200).json(updateFeesInstallment);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);
router.get("/installments/:addmissionId", async (req, res) => {
    try {
        const addmissionId = req.params.addmissionId;

        const student = await service.getStudentById(addmissionId);
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        const installments = await service.getInstallmentsByStudentId(
            addmissionId
        );
        let paidAmt = await feesPaymentModel.getPaidAmount(addmissionId);
        let totalAmount = 0;
        let totalPaidAmount = 0;

        if (paidAmt && paidAmt.length > 0) {
            paidAmt.forEach(item => {
                totalAmount = parseInt(item.courseFee);
                totalPaidAmount += parseInt(item.paidAmount);
            });
        }

        const remainingAmount = totalAmount - totalPaidAmount;

        const response = {
            paidAmount: paidAmt,
            totalAmount: totalAmount,
            remainingAmount: remainingAmount,
            PaidAmount: totalPaidAmount
        };

        res.json({
            status: "Success",
            data: {
                addmissionId: addmissionId,
                student: student,
                amountDetails: response
            }
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get("/get-total-amount", async (req, res) => {
    try {
        const client = new MongoClient(mongoURI);
        await client.connect();
        const Collection = client.db().collection("feesinstallments");
        const pipeline = [
            {
                $group: {
                    _id: null,
                    abc: {
                        $sum: "$installmentAmount",
                    },
                },
            },
        ];
        totalAmount = await Collection.aggregate(pipeline, {
            maxTimeMS: 60000,
            allowDiskUse: true,
        }).toArray();
        res.json(totalAmount);
        await client.close();
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/get-collected-amount", async (req, res) => {
    try {
        const client = new MongoClient(mongoURI);
        await client.connect();
        const Collection = client.db().collection("feesinstallments");
        const pipeline = [
            {
                $match: {
                    isPaid: true,
                },
            },
            {
                $group: {
                    _id: "$isPaid",
                    fieldN: {
                        $sum: "$installmentAmount",
                    },
                },
            },
        ];
        collectedAmount = await Collection.aggregate(pipeline, {
            maxTimeMS: 60000,
            allowDiskUse: true,
        }).toArray();
        res.json(collectedAmount);
        await client.close();
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/get-remainingFees", async (req, res) => {
    const remainingFees = totalAmount - collectedAmount;
    res.json(remainingFees);
});

router.get("/get-fees-summary", async (req, res) => {
    try {
        const {
            groupId,
            feesTemplateId,
            academicYear,
            currentYear,
            month,
            startDate,
            endDate,
        } = req.query;

        const courses = await service.getAllDataByGroupId(groupId);

        const coursesWithTotalStudents = await Promise.all(
            courses.map(async (course) => {
                const totalStudents = await service.getTotalStudents(
                    course.courseId
                );
                const totalFeesObj = await service.getTotalFeesAndPendingFees(
                    course.courseId,
                    groupId,
                    feesTemplateId,
                    academicYear
                );
                const paidFees =
                    totalFeesObj.totalFees - totalFeesObj.pendingFees;

                return {
                    courseName: course.CourseName,
                    courseId: course.courseId,
                    totalStudents: totalStudents,
                    totalFees: totalFeesObj.totalFees,
                    pendingFees: totalFeesObj.pendingFees,
                    paidFees: totalFeesObj.paidFees,
                };
            })
        );

        let totalFees = 0;
        let totalPaidFees = 0;
        let totalPendingFees = 0;
        coursesWithTotalStudents.forEach((course) => {
            totalFees += course.totalFees;
            totalPaidFees += course.paidFees;
            totalPendingFees += course.pendingFees;
        });

        const response = {
            groupId,
            feesTemplateId,
            academicYear,
            courses: coursesWithTotalStudents,
            totalFees,
            totalPaidFees,
            totalPendingFees,
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/get-classes-fees", async (req, res) => {
    try {
        const { groupId, feesTemplateId, academicYear, courseId } = req.query;

        const classes = await service.getAllDataByCourseId(groupId, courseId);

        const response = {
            groupId,
            feesTemplateId,
            academicYear,
            courseId,
            classes: [],
        };

        for (const classObj of classes) {
            const totalStudents = await service.getTotalStudentsForClass(
                classObj.classId,
                feesTemplateId,
                groupId
            );

            const totalFeesObj =
                await service.getTotalFeesAndPendingFeesForClass(
                    classObj.classId,
                    groupId,
                    feesTemplateId,
                    academicYear
                );

            let totalFees = 0;
            let pendingFees = 0;
            let paidFees = 0;

            if (totalStudents == 0 || !totalFeesObj) {
                totalFees = 0;
                pendingFees = 0;
                paidFees = 0;
            } else {
                totalFees = totalFeesObj.totalFees * totalStudents;
                pendingFees = totalFeesObj.pendingFees;
                paidFees = totalFeesObj.paidFees;
            }

            response.classes.push({
                name: classObj.name,
                classId: classObj.classId,
                totalStudents,
                totalFees,
                pendingFees,
                paidFees,
            });
        }

        res.json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
