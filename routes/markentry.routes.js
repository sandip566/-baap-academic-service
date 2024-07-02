const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/markentry.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/markentry.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }

        const markEntryId = +Date.now();
        req.body.markEntryId = markEntryId;

        if (req.body.subjectWiseRequests && Array.isArray(req.body.subjectWiseRequests)) {
            req.body.subjectWiseRequests = req.body.subjectWiseRequests.map((request) => {
                return {
                    ...request,
                    subjectWiseRequestsId: +Date.now() + Math.floor(Math.random() * 10000),
                };
            });

            const anyMarkedEntry = req.body.subjectWiseRequests.some(
                (request) => request.isMarkedEntry
            );

            if (!anyMarkedEntry) {
                return res.status(400).json({
                    success: false,
                    message: "Please Select Student",
                });
            }
        }

        try {
            const serviceResponse = await service.create(req.body);
            requestResponsehelper.sendResponse(res, serviceResponse);
        } catch (error) {
            console.error("Error:", error);
            next(error);
        }
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

router.get("/all/markEntry", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});

    requestResponsehelper.sendResponse(res, serviceResponse);
});

module.exports = router;
