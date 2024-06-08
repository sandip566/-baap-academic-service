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
            if (req.body.returnQuantity > assetRequest.quantity) {
                return res
                    .status(400)
                    .json({ error: "You don't have any asset for return" });
            }
            const serviceResponse = await service.create(req.body);

            if (!assetRequest) {
                throw new Error("Asset request not found");
            }

            console.log(assetRequest);

            const returnQuantity = Number(req.body.returnQuantity);
            if (isNaN(returnQuantity)) {
                throw new Error("Invalid returnQuantity");
            }

            const currentQuantity = Number(assetRequest.quantity);
            if (isNaN(currentQuantity)) {
                throw new Error("Invalid quantity in asset request");
            }

            const newQuantity = Math.max(currentQuantity - returnQuantity, 0);

            const totalreturnqty = await AssetReturnModel.find({
                groupId: req.body.groupId,
                requestId: req.body.requestId,
            });

            console.log("totalreturnqty", totalreturnqty);
            const updatedData = await AssetRequestModel.findOneAndUpdate(
                { requestId: req.body.requestId, groupId: req.body.groupId },
                {
                    quantity: newQuantity,
                    returnQuantity: totalreturnqty.length,
                },
                { new: true }
            );

            const assetId = updatedData.assetId;
            const asset = await AssetModel.findOne({ assetId: assetId });
            if (!asset) {
                throw new Error("Asset not found");
            }

            const currentAvailable = Number(asset.available);
            if (isNaN(currentAvailable)) {
                throw new Error("Invalid available quantity in asset");
            }

            const currentValue = Number(asset.currentValue);
            if (isNaN(currentValue)) {
                throw new Error("Invalid current value in asset");
            }

            const newAvailable = Math.min(
                currentAvailable + returnQuantity,
                currentValue
            );

            await AssetModel.findOneAndUpdate(
                { assetId: assetId },
                { available: newAvailable },
                { new: true }
            );

            requestResponsehelper.sendResponse(res, serviceResponse);
        } catch (error) {
            next(error); // Pass the error to the error handling middleware
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
            const perPage = parseInt(req.query.limit)||10
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
