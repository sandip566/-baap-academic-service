const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/feestemplatetype.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const TokenService = require("../services/token.services");

router.post(
    "/",
    checkSchema(require("../dto/feestemplatetype.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const feesTemplateTypeId = +Date.now();
        req.body.feesTemplateTypeId = feesTemplateTypeId;
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
router.get("/all/getByGroupId/:groupId", TokenService.checkPermission(["EMT1"]), async (req, res) => {
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
    "/feesTemplateTypeId/:feesTemplateTypeId",TokenService.checkPermission(["EMT1"]),
    async (req, res) => {
        const serviceResponse = await service.getByFeesTemplateTypeId(req.params.feesTemplateTypeId);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
router.put("/groupId/:groupId/feesTemplateTypeId/:feesTemplateTypeId", TokenService.checkPermission(["EMT1"]), async (req, res) => {
    try {
      const feesTemplateTypeId = req.params.feesTemplateTypeId;
      const groupId = req.params.groupId;
      const newData = req.body;
      const data = await service.updateByFeesTemplateTypeId(feesTemplateTypeId, groupId, newData);
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
  
  router.delete("/groupId/:groupId/feesTemplateTypeId/:feesTemplateTypeId", TokenService.checkPermission(["EMT1"]), async (req, res) => {
    try {
      const feesTemplateTypeId = req.params.feesTemplateTypeId;
      const groupId = req.params.groupId;
      const data = await service.deleteByFeesTemplateTypeId(feesTemplateTypeId, groupId);
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
router.get("/all/feesTemplateType", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});

    requestResponsehelper.sendResponse(res, serviceResponse);
});

module.exports = router;
