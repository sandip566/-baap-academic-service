const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/assetreturn.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const AssetRequestModel = require("../schema/assetrequest.schema");
const AssetModel = require("../schema/asset.schema");
const AssetReturnModel = require("../schema/assetreturn.schema");
const TokenService = require("../services/token.services");

router.post(
    "/",
    checkSchema(require("../dto/assetreturn.dto")),
    async (req, res, next) => {
        try {
            if (ValidationHelper.requestValidationErrors(req, res)) {
                return;
            }
            const returnAssetId = +Date.now();
            req.body.returnAssetId = returnAssetId;
            const assetRequest = await AssetRequestModel.findOne({
                requestId: req.body.requestId,
                groupId: req.body.groupId,
            });
            if (!assetRequest) {
                return res.status(400).json({ error: "Asset request not found" });
            }
            const returnQuantity = Number(req.body.returnQuantity);
            if (isNaN(returnQuantity)) {
                return res.status(400).json({ error: "Invalid returnQuantity" });
            }
            if (returnQuantity > assetRequest.quantity) {
                return res.status(400).json({ error: "You don't have enough assets for return" });
            }
            const totalreturnqty = await AssetReturnModel.find({
                groupId: req.body.groupId,
                requestId: req.body.requestId,
            });
            const updatedData = await AssetRequestModel.findOneAndUpdate(
                { requestId: req.body.requestId, groupId: req.body.groupId },
                {
                    quantity: Math.max(assetRequest.quantity - returnQuantity, 0),
                    returnQuantity: totalreturnqty.length,
                },
                { new: true }
            );
            const assetId = updatedData.assetId;
            const asset = await AssetModel.findOne({ assetId: assetId });
            if (!asset) {
                return res.status(400).json({ error: "Asset not found" });
            }
            const currentValue = Number(asset.currentValue);
            if (isNaN(currentValue)) {
                return res.status(400).json({ error: "Invalid current value in asset" });
            }
            const newAvailable = Math.min(
                Number(asset.available) + returnQuantity,
                currentValue
            );
            await AssetModel.findOneAndUpdate(
                { assetId: assetId },
                { available: newAvailable },
                { new: true }
            );
            const assetAggregation = await AssetReturnModel.aggregate([
                { $match: { assetId: assetId } },
                { $group: { _id: null, totalReturnQuantity: { $sum: "$returnQuantity" } } }
            ]);
            const totalReturnQuantity = assetAggregation.length > 0 ? assetAggregation[0].totalReturnQuantity : 0;
            await AssetModel.findOneAndUpdate(
                { assetId: assetId },
                { count: totalReturnQuantity },
                { new: true }
            );
            requestResponsehelper.sendResponse(res, { message: "Asset return created successfully" });
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    "/all/getByGroupId/:groupId",
    // TokenService.checkPermission(["EAC1"]),
    async (req, res) => {
        try {
            const groupId = req.params.groupId;
            const page = parseInt(req.query.page) || 1;
            const perPage = parseInt(req.query.limit) || 10
            const criteria = {
                // phoneNumber: req.query.phoneNumber,
                name: req.query.name,
                status: req.query.status,
                search: req.query.search,
            };
            const serviceResponse = await service.getAllDataByGroupId(
                groupId,
                criteria,
                page,
                perPage
            );
            requestResponsehelper.sendResponse(res, serviceResponse);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.get("/returnAssetId/:returnAssetId", async (req, res) => {
    const serviceResponse = await service.getByAssetTypeId(
        req.params.returnAssetId
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.put(
    "/groupId/:groupId/returnAssetId/:returnAssetId",
    async (req, res) => {
        try {
            const returnAssetId = req.params.returnAssetId;
            const groupId = req.params.groupId;
            const newData = req.body;
            const data = await service.updateByAssetId(
                returnAssetId,
                groupId,
                newData
            );
            if (!data) {
                res.status(404).json({ error: "Asset not found to update" });
            } else {
                res.status(201).json(data);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.delete(
    "/groupId/:groupId/returnAssetId/:returnAssetId",
    async (req, res) => {
        try {
            const returnAssetId = req.params.returnAssetId;
            const groupId = req.params.groupId;
            const data = await service.deleteByAssetId(returnAssetId, groupId);
            if (!data) {
                res.status(404).json({ error: "Asset not found to delete" });
            } else {
                res.status(201).json(data);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
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

router.get("/all/assetReturn", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});
    requestResponsehelper.sendResponse(res, serviceResponse);
});

module.exports = router;
