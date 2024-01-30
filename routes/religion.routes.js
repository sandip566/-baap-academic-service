const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/religion.services");
const requestResponseHelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const validationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
  "/",
  checkSchema(require("../dto/religion.dto")),
  async (req, res, next) => {
    if (validationHelper.requestValidationErrors(req, res)) {
      return;
    }
    const religionId = +Date.now();
    req.body.religionId = religionId;
    const serviceResponse = await service.create(req.body);
    requestResponseHelper.sendResponse(res, serviceResponse);
  }
);

router.get("/all", async (req, res) => {
  const serviceResponse = await service.getAllByCriteria({});
  requestResponseHelper.sendResponse(res, serviceResponse);
});

router.get("/all/getByGroupId/:groupId", async (req, res) => {
  const groupId = req.params.groupId;
  const criteria = {
    religionId: req.query.religionId,
    name: req.query.name
  };
  const serviceResponse = await service.getAllDataByGroupId(
    groupId,
    criteria
  );
  requestResponseHelper.sendResponse(res, serviceResponse);
});

router.delete("/religionId/:religionId", async (req, res) => {
  try {
    const religionId = req.params.religionId;
    const data = await service.deleteReligionById({ religionId });
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

router.put("/religionId/:religionId", async (req, res) => {
  try {
    const religionId = req.params.religionId;
    const newData = req.body;
    const updateData = await service.updateReligionById(religionId, newData);
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

module.exports = router;
