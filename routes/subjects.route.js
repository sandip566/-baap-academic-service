const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/subjects.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
  "/",
  checkSchema(require("../dto/subject.dto")),
  async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
      return;
    }
    const existingRecord = await service.getBySubjectIdAndGroupId(req.body.groupId,req.body.name);
    console.log(existingRecord);
    if (existingRecord.data) {
        return res.status(404).json({ error: "Name,Code With The Same GroupId Already Exists." });
    }
    const subjectId = +Date.now();
    req.body.subjectId = subjectId;
    const serviceResponse = await service.create(req.body);
    requestResponsehelper.sendResponse(res, serviceResponse);
  }
);

router.get("/all", async (req, res) => {
  const serviceResponse = await service.getAllByCriteria({});
  requestResponsehelper.sendResponse(res, serviceResponse);
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

router.delete("/groupId/:groupId/subjectId/:subjectId", async (req, res) => {
  try {
    const subjectId = req.params.subjectId
    const groupId = req.params.groupId
    const subjectData = await service.deleteBySubjectId({ subjectId: subjectId, groupId: groupId })
    if (!subjectData) {
      res.status(404).json({ error: 'Subject data not found to delete' })
    } else {
      res.status(201).json(subjectData)
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put("/groupId/:groupId/subjectId/:subjectId", async (req, res) => {
  try {
    const subjectId = req.params.subjectId;
    const groupId = req.params.groupId;
    const newData = req.body;
    const updatedData = await service.updateSubjectById(subjectId, groupId, newData);
    if (!updatedData) {
      res.status(404).json({ error: 'Subject not found to update' });
    } else {
      res.status(201).json(updatedData);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get("/all/getByGroupId/:groupId", async (req, res) => {
  const groupId = req.params.groupId;
  const criteria = {
    subjectName: req.query.subjectName,
    courseId: req.query.courseId,
    divisionId: req.query.divisionId,
    classId: req.query.classId,
    subjectId: req.query.subjectId,
  };
  const serviceResponse = await service.getAllDataByGroupId(
    groupId,
    criteria
  );
  requestResponsehelper.sendResponse(res, serviceResponse);
});
module.exports = router;
