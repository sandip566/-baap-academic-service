const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/librarypayment.service");
const Payment = require("../schema/librarypayment.schema");
const BookIssueLog = require("../schema/bookIssueLog.schema");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const libraryPaymentModel =require("../schema/librarypayment.schema")
router.post(
    "/",
    checkSchema(require("../dto/librarypayment.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const { bookIssueLogId, userId } = req.body;
        try {
            const existingPayment = await Payment.findOne({
                bookIssueLogId: bookIssueLogId,
                userId: userId,
            });

            if (existingPayment) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Payment for this book issue has already been made.",
                });
            }
            const libraryPaymentId = +Date.now();
            req.body.libraryPaymentId = libraryPaymentId;
            const serviceResponse = await service.create(req.body);
            await BookIssueLog.findOneAndUpdate(
                { bookIssueLogId: bookIssueLogId },
                {
                    $unset: { isOverdue: "" },
                    $set: { overdueStatus: "Paid" },
                },
                { new: true }
            );
            requestResponsehelper.sendResponse(res, serviceResponse);
        } catch (error) {
            next(error);
        }
    }
);

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        libraryPaymentId: req.query.libraryPaymentId,
        empId: req.query.empId,
        userId: req.query.userId,
        search: req.query.search,
        // username:req.query.search
        // page: req.query.page ,
        // limit: req.query.limit
    };
    const page = parseInt(req.query.pageNumber) || 1;
    const limit = parseInt(req.query.pageSize) || 100;
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria,
        page,
        limit
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.get(
    "/getLibraryPayment/groupId/:groupId/userId/:userId/bookIssueLogId/:bookIssueLogId",
    async (req, res) => {
        const groupId = req.params.groupId;
        const userId = req.params.userId;
        const bookIssueLogId = req.params.bookIssueLogId;
        const serviceResponse = await service.getPenalty(
            groupId,
            userId,
            bookIssueLogId
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.delete(
    "/groupId/:groupId/libraryPaymentId/:libraryPaymentId",
    async (req, res) => {
        try {
            const libraryPaymentId = req.params.libraryPaymentId;
            const groupId = req.params.groupId;
            const Data = await service.deleteLibraryPaymentById({
                libraryPaymentId: libraryPaymentId,
                groupId: groupId,
            });
            if (!Data) {
                res.status(404).json({
                    error: "LibraryPayment data not found to delete",
                });
            } else {
                res.status(201).json(Data);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.put(
    "/groupId/:groupId/libraryPaymentId/:libraryPaymentId",
    async (req, res) => {
        try {
            const libraryPaymentId = req.params.libraryPaymentId;
            const groupId = req.params.groupId;
            const newData = req.body;
            const updateData = await service.updateLibraryPaymentById(
                libraryPaymentId,
                groupId,
                newData
            );
            if (!updateData) {
                res.status(404).json({
                    error: " LibraryPayment data not found to update",
                });
            } else {
                res.status(200).json(updateData);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const libraryPaymentId = req.body.libraryPayment;

        if (!Array.isArray(libraryPaymentId) || libraryPaymentId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty libraryPaymentId array",
            });
        }

        const numericIds = libraryPaymentId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${libraryPaymentId}`);
            }
            return num;
        });

        const result = await libraryPaymentModel.deleteMany({
            groupId: groupId,
            libraryPaymentId: { $in: numericIds },
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
