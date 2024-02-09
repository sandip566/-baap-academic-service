const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/division.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const TokenService = require("../services/token.services");
router.post(
  "/",
  checkSchema(require("../dto/division.dto")),TokenService.checkPermission(["EMDD2"]),
  async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
      return;
    }
    const existingRecord = await service.getByCourseIdAndGroupId(req.body.groupId,req.body.Name,req.body.courseId,req.body.classId);
        console.log(existingRecord);
        if (existingRecord.data) {
           
            return res.status(404).json({ error: "Data With The Same GroupId Already Exists." });
        }
    const divisionId = +Date.now();
    req.body.divisionId = divisionId;
    const serviceResponse = await service.create(req.body);
    requestResponsehelper.sendResponse(res, serviceResponse);
  }
);

router.get("/all", async (req, res) => {
  const serviceResponse = await service.getAllByCriteria({});
  requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/:id",TokenService.checkPermission(["EMDD4"]), async (req, res) => {
  const serviceResponse = await service.deleteById(req.params.id);
  requestResponsehelper.sendResponse(res, serviceResponse);
});

router.put("/:id",TokenService.checkPermission(["EMDD3"]), async (req, res) => {
  const serviceResponse = await service.updateById(req.params.id, req.body);
  requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/:id",TokenService.checkPermission(["EMDD1"]), async (req, res) => {
  const serviceResponse = await service.getById(req.params.id);
  requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/groupId/:groupId/divisionId/:divisionId",TokenService.checkPermission(["EMDD4"]), async (req, res) => {
  try {
    const divisionId = req.params.divisionId
    const groupId = req.params.groupId
    const divisionData = await service.deleteByDivisionId({ divisionId: divisionId, groupId: groupId })
    if (!divisionData) {
      res.status(404).json({ warning: 'Division data not found to delete' })
    } else {
      res.status(201).json(divisionData)
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.put("/groupId/:groupId/divisionId/:divisionId",TokenService.checkPermission(["EMDD3"]), async (req, res) => {
  try {
    const divisionId = req.params.divisionId;
    const groupId = req.params.groupId;
    const newData = req.body;
    const updatedData = await service.updateDivisionById(divisionId, groupId, newData);
    if (!updatedData) {
      res.status(404).json({ error: 'Division not found to update' });
    } else {
      res.status(201).json(updatedData);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get("/all/getByGroupId/:groupId",TokenService.checkPermission(["EMDD1"]), async (req, res) => {
  const groupId = req.params.groupId;
  const criteria = {
    Name: req.query.Name,
    courseId: req.query.courseId,
    classId: req.query.classId,
    divisionId: req.query.divisionId,
    incharge: req.query.incharge
  };
  const serviceResponse = await service.getAllDataByGroupId(
    groupId,
    criteria
  );
  requestResponsehelper.sendResponse(res, serviceResponse);
});
module.exports = router;
