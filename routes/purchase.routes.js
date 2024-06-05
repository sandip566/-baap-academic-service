const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/purchase.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const publisherModel = require("../schema/publisher.schema");
const PurchaseModel = require("../schema/purchase.schema");

router.post(
    "/",
    checkSchema(require("../dto/purchase.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const purchaseId = +Date.now();
        req.body.purchaseId = purchaseId;
        const totalAmount = req.body.quantity * req.body.unitPrice;
        req.body.totalAmount = totalAmount;
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

router.get("/all/purchase", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});

    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.delete("/groupId/:groupId/purchaseId/:purchaseId", async (req, res) => {
    try {
        const purchaseId = req.params.purchaseId;
        const groupId = req.params.groupId;
        const transactionData = await service.deleteByTransactionId({
            purchaseId: purchaseId,
            groupId: groupId,
        });
        if (!transactionData) {
            res.status(404).json({
                error: "transaction data not found to delete",
            });
        } else {
            res.status(201).json(transactionData);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/groupId/:groupId/purchaseId/:purchaseId", async (req, res) => {
    try {
        const purchaseId = req.params.purchaseId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const updatedData = await service.updateTransactionById(
            purchaseId,
            groupId,
            newData
        );
        if (!updatedData) {
            res.status(404).json({ error: "Transaction not found to update" });
        } else {
            res.status(201).json(updatedData);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const criteria = {
            vendorId: req.query.vendorId,
            purchaseId: req.query.purchaseId,
            search: req.query.search,
            orderStatus: req.query.orderStatus,
            book: req.query.book,
            unitPrice: req.query.unitPrice,
            quantity: req.query.quantity

        };

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;

        const { searchFilter } = await service.getAllDataByGroupId(
            groupId,
            criteria,
            skip,
            limit,
         
        );
        const totalCount = await PurchaseModel.countDocuments(searchFilter);
        const purchase = await PurchaseModel.find(searchFilter)
        .sort({ createdAt: -1 }) 
            .skip(skip)
            .limit(limit)
            .exec()
            

            

        res.json({
            status: "Success",
            data: {
                items: purchase,
                totalCount: totalCount,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.post("/bulkUpload", async (req, res, next) => {
    try {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }

        const purchaseData = req.body.map((data) => {
            return {
                ...data,
                purchaseId: +Date.now() ,
                totalAmount:data.quantity *data.unitPrice
        
            };
        });

        const serviceResponse = await service.bulkUpload(purchaseData);
        requestResponsehelper.sendResponse(res, serviceResponse);
    } catch (error) {
        // Handle errors
        console.error("Error occurred during bulk upload:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
