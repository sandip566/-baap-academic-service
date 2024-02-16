const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/categories.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const TokenService = require("../services/token.services");

router.post(
  "/",
  checkSchema(require("../dto/categories.dto")), TokenService.checkPermission(["EFC2"]),
  async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
      return;
    }
    const existingRecord = await service.getByCourseIdAndGroupId(req.body.name);
    console.log(existingRecord);
    if (existingRecord.data) {

      return res.status(409).json({ error: " Same Name Already Exists." });
    }
    const categoriseId = +Date.now();
    req.body.categoriseId = categoriseId;
    const serviceResponse = await service.create(req.body);
    requestResponsehelper.sendResponse(res, serviceResponse);
  }
);

router.get("/all", TokenService.checkPermission(["EFC1"]), async (req, res) => {
  const serviceResponse = await service.getAllByCriteria({});
  requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/:id", TokenService.checkPermission(["EFC4"]), async (req, res) => {
  const serviceResponse = await service.deleteById(req.params.id);
  requestResponsehelper.sendResponse(res, serviceResponse);
});

router.put("/:id", TokenService.checkPermission(["EFC2"]), async (req, res) => {
  const serviceResponse = await service.updateById(req.params.id, req.body);
  requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/:id", TokenService.checkPermission(["EFC1"]), async (req, res) => {
  const serviceResponse = await service.getById(req.params.id);
  requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/categoriesId/:categoriesId", TokenService.checkPermission(["EFC4"]), async (req, res) => {
  try {
    const categoriesId = req.params.categoriesId;
    const data = await service.deleteCategoriesById({ categoriesId });
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

router.put("/categoriesId/:categoriesId", TokenService.checkPermission(["EFC3"]), async (req, res) => {
  try {
    const categoriesId = req.params.categoriesId;
    const newData = req.body;
    const updateData = await service.updateCategoriesById(categoriesId, newData);
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
module.exports = router;
