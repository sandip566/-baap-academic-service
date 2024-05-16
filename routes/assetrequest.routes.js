const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/assetrequest.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/assetrequest.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const requestId = +Date.now();
        req.body.requestId = requestId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.post(
    "/data/save",
    checkSchema(require("../dto/assetrequest.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        try {
            if (req.body.type === "new") {
                const requestId = +Date.now();
                req.body.requestId = requestId;
                const serviceResponse = await service.create(req.body);
                requestResponsehelper.sendResponse(res, serviceResponse);
            } else if (req.body.requestId) {
                const serviceResponse = await service.updateRequest(
                    req.body.requestId,
                    req.body
                );
                requestResponsehelper.sendResponse(res, serviceResponse);
            } else {
                res.status(400).json({ error: "Invalid request" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
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

router.get("/all/assetRequest", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        name: req.query.name,
        userName: req.query.userName,
        type: req.query.type,
        status: req.query.status,
        category: req.query.category,
        search: req.query.search,
        managerUserId: req.query.managerUserId,
        empId: req.query.empId,
        userId: req.query.userId,
        pageNumber: parseInt(req.query.pageNumber) || 1,
        pageSize: parseInt(req.query.pageSize) || 10,
    };
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/getByRequestId/:id", async (req, res) => {
    const serviceResponse = await service.getByDataId(req.params.id);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/groupId/:groupId/requestId/:requestId", async (req, res) => {
    try {
        const requestId = req.params.requestId;
        const groupId = req.params.groupId;
        const Data = await service.deleteByDataId(requestId, groupId);
        if (!Data) {
            res.status(404).json({ error: "Data not found to delete" });
        } else {
            res.status(201).json(Data);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/groupId/:groupId/requestId/:requestId", async (req, res) => {
    const requestId = req.params.requestId;
    const groupId = req.params.groupId;
    const updateData = req.body;
    try {
        const serviceResponse = await service.updateDataById(
            requestId,
            groupId,
            updateData
        );
        if (serviceResponse) {
            const response = {
                data: serviceResponse,
                message: "Data updated successfully",
            };
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: "Data not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/get-assets-details-of-user/:userId", async (req, res) => {
    const serviceResponse = await service.getAssetsDetailsById(
        req.params.userId
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.get("/getDataByRequestId/:requestId", async (req, res) => {
    const serviceResponse = await service.getAssetsDetailsByRequestId(
        req.params.requestId
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.get("/getClearanceData/groupId/:groupId/userId/:userId", async (req, res) => {
    const { groupId, userId } = req.params;
    try {
        const serviceResponse = await service.getClearanceData(groupId, userId);
        requestResponsehelper.sendResponse(res, serviceResponse);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
module.exports = router;
