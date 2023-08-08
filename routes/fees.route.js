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

module.exports = router;
