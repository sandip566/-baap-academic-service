const express = require('express');
const router = express.Router();
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const feesService = require('../service/fees.service');
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");


router.post('/academic/api/fees', async (req, res) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }

    const serviceResponse = await feesService.create(req.body);

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/academic/api/fees/group/:groupId/member/:member_id", async (req, res) => {
    const groupId = req.params.groupId;
    const memberId = req.params.member_id;
    const feesType = req.query.feesType;

    try {
        const response = await feesService.getFeesByParams(groupId, memberId, feesType);
        const feesTypeData = response.data.items[0];
        res.status(200).json({
            message: "Data fetch successfully",
            data: feesTypeData,
            totalItemsCount: response.data.totalItemsCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ TypeError });
    }
});

module.exports = router;
