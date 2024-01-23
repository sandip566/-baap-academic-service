const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/studentAdmission.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post("/", checkSchema(require("../dto/studentAdmission.dto")), async (req, res, next) => {
  try {
    if (ValidationHelper.requestValidationErrors(req, res)) {
      return;
    }
    const studentAdmissionId = +Date.now();
    req.body.studentAdmissionId = studentAdmissionId;
    const serviceResponse = await service.create(req.body);
    requestResponsehelper.sendResponse(res, serviceResponse);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const serviceResponse = await service.deleteById(req.params.id);
    requestResponsehelper.sendResponse(res, serviceResponse);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const serviceResponse = await service.updateById(req.params.id, req.body);
    requestResponsehelper.sendResponse(res, serviceResponse);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const serviceResponse = await service.getById(req.params.id);
    requestResponsehelper.sendResponse(res, serviceResponse);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get("/all/studentsAddmision", async (req, res) => {
  try {
    const serviceResponse = await service.getAllByCriteria({});
    requestResponsehelper.sendResponse(res, serviceResponse);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get("/all/getByGroupId/:groupId", async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const criteria = {
      studentsAddmisionId: req.query.studentsAddmisionId,
    };
    const serviceResponse = await service.getAllDataByGroupId(groupId, criteria);
    requestResponsehelper.sendResponse(res, serviceResponse);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete("/groupId/:groupId/studentAdmissionId/:studentAdmissionId", async (req, res) => {
  try {
    const studentAdmissionId = req.params.studentAdmissionId
    const groupId = req.params.groupId
    const Data = await service.deleteByStudentsAddmisionId({ studentAdmissionId:studentAdmissionId, groupId: groupId })
    if (!Data) {
      res.status(404).json({ error: 'data not found to delete' })
    } else {
      res.status(201).json(Data)
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put("/groupId/:groupId/studentAdmissionId/:studentAdmissionId", async (req, res) => {
  try {
    const studentAdmissionId = req.params.studentAdmissionId;
    const groupId = req.params.groupId;
    const newData = req.body;
    const updatedData = await service.updateStudentsAddmisionById(studentAdmissionId, groupId, newData);
    if (!updatedData) {
      res.status(404).json({ error: ' not found to update' });
    } else {
      res.status(201).json(updatedData);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
