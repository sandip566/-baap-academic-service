const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/librarypayment.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/librarypayment.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const libraryPaymentId=+Date.now();
        req.body.libraryPaymentId=libraryPaymentId
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        libraryPaymentId: req.query.libraryPaymentId,
        empId: req.query.empId,
        userId:req.query.userId,
        pageNumber: parseInt(req.query.pageNumber) || 1,
    };
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/groupId/:groupId/libraryPaymentId/:libraryPaymentId", async (req, res) => {
    try {
        const libraryPaymentId = req.params.libraryPaymentId;
        const groupId = req.params.groupId;
        const Data = await service.deleteLibraryPaymentById({
            libraryPaymentId: libraryPaymentId,
            groupId: groupId,
        });
        if (!Data) {
            res.status(404).json({ error: "LibraryPayment data not found to delete" });
        } else {
            res.status(201).json(Data);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/groupId/:groupId/libraryPaymentId/:libraryPaymentId", async (req, res) => {
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
            res.status(404).json({ error: " LibraryPayment data not found to update" });
        } else {
            res.status(200).json(updateData);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
module.exports = router;
