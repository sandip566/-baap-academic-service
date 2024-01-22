const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/relegion.services");
const requestResponseHelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const validationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
  "/",
  checkSchema(require("../dto/relegion.dto")),
  async (req, res, next) => {
    if (validationHelper.requestValidationErrors(req, res)) {
      return;
    }
    const relegionId = +Date.now();
    req.body.relegionId = relegionId;
    const serviceResponse = await service.create(req.body);
    requestResponseHelper.sendResponse(res, serviceResponse);
  }
);

router.get("/all/getByGroupId/:groupId", async (req, res) => {
  const groupId = req.params.groupId;
  const criteria = {
    relegionId: req.query.relegionId,
  };
  const serviceResponse = await service.getAllDataByGroupId(
    groupId,
    criteria
  );
  requestResponseHelper.sendResponse(res, serviceResponse);
});

router.delete("/relegionId/:relegionId", async (req, res) => {
  try {
    const relegionId = req.params.relegionId;
    const data = await service.deleteRelegionById({relegionId});
    if (!data) {
      res.status(404).json({ error: 'Data not found to delete' });
    } else {
      res.status(201).json(data);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put("/relegionId/:relegionId", async (req, res) => {
  try {
    const relegionId = req.params.relegionId;
    const newData = req.body;
    const updateData = await service.updateRelegionById(relegionId,newData);
    if (!updateData) {
      res.status(404).json({ error: 'Data not found to update' });
    } else {
      res.status(200).json(updateData);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete("/:id", async (req, res) => {
  const serviceResponse = await service.deleteById(req.params.id);
  requestResponseHelper.sendResponse(res, serviceResponse);
});

router.put("/:id", async (req, res) => {
  const serviceResponse = await service.updateById(req.params.id, req.body);
  requestResponseHelper.sendResponse(res, serviceResponse);
});

router.get("/:id", async (req, res) => {
  const serviceResponse = await service.getById(req.params.id);
  requestResponseHelper.sendResponse(res, serviceResponse);
});

router.get("/all/relegions", async (req, res) => {
  const serviceResponse = await service.getAllByCriteria({});
  requestResponseHelper.sendResponse(res, serviceResponse);
});
module.exports = router;
