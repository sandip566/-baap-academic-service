const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const shelfService = require("../services/shelf.services");
const requestResponseHelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const validationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
  "/",
  checkSchema(require("../dto/shelf.dto")),
  async (req, res, next) => {
    if (validationHelper.requestValidationErrors(req, res)) {
      return;
    }
    const shelfId = +Date.now();
    req.body.shelfId = shelfId;
    const serviceResponse = await shelfService.create(req.body);
    requestResponseHelper.sendResponse(res, serviceResponse);
  }
);

router.get("/all", async (req, res) => {
  const serviceResponse = await shelfService.getAllByCriteria({});
  requestResponseHelper.sendResponse(res, serviceResponse);
});

router.get("/all/getByGroupId/:groupId", async (req, res) => {
  const groupId = req.params.groupId;
  const criteria = {
    shelfId: req.query.shelfId,
  };
  const serviceResponse = await shelfService.getAllDataByGroupId(
    groupId,
    criteria
  );
  requestResponseHelper.sendResponse(res, serviceResponse);
});

router.delete("/groupId/:groupId/shelfId/:shelfId", async (req, res) => {
  try {
    const shelfId = req.params.shelfId;
    const groupId = req.params.groupId;
    const data = await shelfService.deleteShelfById({ shelfId, groupId });
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

router.put("/groupId/:groupId/shelfId/:shelfId", async (req, res) => {
  try {
    const shelfId = req.params.shelfId;
    const groupId = req.params.groupId;
    const newData = req.body;
    const updateData = await shelfService.updateShelfById(shelfId, groupId, newData);
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
  const serviceResponse = await shelfService.deleteById(req.params.id);
  requestResponseHelper.sendResponse(res, serviceResponse);
});

router.put("/:id", async (req, res) => {
  const serviceResponse = await shelfService.updateById(req.params.id, req.body);
  requestResponseHelper.sendResponse(res, serviceResponse);
});

router.get("/:id", async (req, res) => {
  const serviceResponse = await shelfService.getById(req.params.id);
  requestResponseHelper.sendResponse(res, serviceResponse);
});
module.exports = router;
