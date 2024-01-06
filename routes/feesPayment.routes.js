const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/feesPayment.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
  "/",
  checkSchema(require("../dto/feesPayment.dto")),
  async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
      return;
    }
    const feesPaymentId = +Date.now();
    req.body.feesPaymentId = feesPaymentId;
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

router.get("/all/FeesPayment", async (req, res) => {
  const serviceResponse = await service.getAllByCriteria({});
  requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/getAllFeesPayment/groupId/:groupId", async (req, res) => {
  const groupId = req.params.groupId;
  const criteria = {
    feesPaymentId: req.query.feesPaymentId,
    memberId: req.query.memberId,
    installmentId: req.query.installmentId
  };
  const serviceResponse = await service.getAllFeesPaymentByGroupId(
    groupId,
    criteria
  );
  requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/groupId/:groupId/feesPaymentId/:feesPaymentId", async (req, res) => {
  try {
    const feesPaymentId = req.params.feesPaymentId;
    const groupId = req.params.groupId;
    const feesPaymentData = await service.deleteFeesPaymentById({ feesPaymentId: feesPaymentId, groupId: groupId });
    if (!feesPaymentData) {
      res.status(404).json({ error: 'feesPayment data not found to delete' });
    } else {
      res.status(201).json(feesPaymentData);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put("/groupId/:groupId/feesPaymentId/:feesPaymentId", async (req, res) => {
  try {
    const feesPaymentId = req.params.feesPaymentId;
    const groupId = req.params.groupId;
    const newData = req.body;
    const updateFeesPayment = await service.updateFeesPaymentById(feesPaymentId, groupId, newData);
    if (!updateFeesPayment) {
      res.status(404).json({ error: 'FeesPayment data not found to update' });
    } else {
      res.status(200).json(updateFeesPayment);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;