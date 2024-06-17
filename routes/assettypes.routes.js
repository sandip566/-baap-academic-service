const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/assettypes.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
  "/",
  checkSchema(require("../dto/assettypes.dto")),
  async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
      return;
    }
    const assetTypeId = +Date.now();
    req.body.assetTypeId = assetTypeId;
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

router.get("/all/getByGroupId/:groupId", async (req, res) => {
  const groupId = req.params.groupId;
  const criteria = {
    name: req.query.name,
    pageNumber: parseInt(req.query.pageNumber) || 1,
    pageSize: parseInt(req.query.pageSize) || 10,
  };
  const serviceResponse = await service.getAllDataByGroupId(
    groupId,
    criteria
  );
  requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get(
  "/assetTypeId/:assetTypeId",
  async (req, res) => {
    const serviceResponse = await service.getByAssetTypeId(req.params.assetTypeId);
    requestResponsehelper.sendResponse(res, serviceResponse);
  }
);

router.put("/groupId/:groupId/assetTypeId/:assetTypeId", async (req, res) => {
  try {
    const assetTypeId = req.params.assetTypeId;
    const groupId = req.params.groupId;
    const newData = req.body;
    const data = await service.updateByAssetId(assetTypeId, groupId, newData);
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

router.delete("/groupId/:groupId/assetTypeId/:assetTypeId", async (req, res) => {
  try {
    const assetTypeId = req.params.assetTypeId;
    const groupId = req.params.groupId;
    const data = await service.deleteByAssetId(assetTypeId, groupId);
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

router.get("/all/assetTypes", async (req, res) => {
  const serviceResponse = await service.getAllByCriteria({});
  requestResponsehelper.sendResponse(res, serviceResponse);
});

module.exports = router;
