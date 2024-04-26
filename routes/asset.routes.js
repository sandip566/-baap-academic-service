const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/asset.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
  "/",
  checkSchema(require("../dto/asset.dto")),
  async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
      return;
    }
    const assetId = +Date.now();
    req.body.assetId = assetId;
    const serviceResponse = await service.create(req.body);
    requestResponsehelper.sendResponse(res, serviceResponse);
  }
);

router.get("/all/getByGroupId/:groupId", async (req, res) => {
  const groupId = req.params.groupId;
  const criteria = {
    assetId: req.query.assetId,
    assetName: req.query.assetName,
    location: req.query.location,
    status: req.query.status,
    assetType: req.query.assetType,
    serialNo: req.query.serialNo,
    modelName: req.query.modelName,
    pageNumber: parseInt(req.query.pageNumber) || 1,
    pageSize: parseInt(req.query.pageSize) || 10,

  };
  const serviceResponse = await service.getAllDataByGroupId(
    groupId,
    criteria
  );
  requestResponsehelper.sendResponse(res, serviceResponse);
});

router.put("/groupId/:groupId/assetId/:assetId", async (req, res) => {
  try {
    const assetId = req.params.assetId;
    const groupId = req.params.groupId;
    const newData = req.body;
    const data = await service.updateByAssetId(assetId, groupId, newData);
    if (!data) {
      res.status(404).json({ error: 'Asset not found to update' });
    } else {
      res.status(201).json(data);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete("/groupId/:groupId/assetId/:assetId", async (req, res) => {
  try {
    const assetId = req.params.assetId;
    const groupId = req.params.groupId;
    const data = await service.deleteByAssetId(assetId, groupId);
    if (!data) {
      res.status(404).json({ error: 'Asset not found to delete' });
    } else {
      res.status(201).json(data);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
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

router.get("/all/asset", async (req, res) => {
  const serviceResponse = await service.getAllByCriteria({});

  requestResponsehelper.sendResponse(res, serviceResponse);
});

module.exports = router;
