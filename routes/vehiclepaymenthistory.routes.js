const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/vehiclepaymenthistory.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/vehiclepaymenthistory.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const vehiclepaymenthistoryId=+Date.now();
        req.body.vehiclepaymenthistoryId=vehiclepaymenthistoryId
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all/vehiclepaymenthistory", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});

    requestResponsehelper.sendResponse(res, serviceResponse);
});


router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        vehiclepaymenthistoryId: req.query.vehiclepaymenthistoryId,
      
    };
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/groupId/:groupId/vehiclepaymenthistoryId/:vehiclepaymenthistoryId", async (req, res) => {
    try {
        const vehiclepaymenthistoryId = req.params.vehiclepaymenthistoryId;
        const groupId = req.params.groupId;
        const Data = await service.deleteTripHistroyById({
            vehiclepaymenthistoryId: vehiclepaymenthistoryId,
            groupId: groupId,
        });
        if (!Data) {
            res.status(404).json({ error: "vehiclepaymenthistory data not found to delete" });
        } else {
            res.status(201).json(Data);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/groupId/:groupId/vehiclepaymenthistoryId/:vehiclepaymenthistoryId", async (req, res) => {
    try {
        const vehiclepaymenthistoryId = req.params.vehiclepaymenthistoryId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const updateData = await service.updatevehiclepaymenthistoryById(
            vehiclepaymenthistoryId,
            groupId,
            newData
        );
        if (!updateData) {
            res.status(404).json({ error: "data not found to update" });
        } else {
            res.status(200).json(updateData);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




module.exports = router;
