const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/academicyear.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const TokenService = require("../services/token.services");

router.post(
    "/",
    checkSchema(require("../dto/academicyear.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const existingRecord = await service.getByCourseIdAndGroupId(req.body.groupId,req.body.year);
        console.log(existingRecord);
        if (existingRecord.data) {
           
            return res.status(400).json({ error: "Data With The Same GroupId Already Exists." });
        }
        if (req.body.startDate > req.body.endDate) {
            return res.status(400).json({ error: "Start Year must be greater than End Year." });
        }
        const academicYearId = +Date.now();
        req.body.academicYearId = academicYearId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/groupId/:groupId/academicYearId/:academicYearId",TokenService.checkPermission(["OSR"]), async (req, res) => {
    try {
      
        const groupId = req.params.groupId;
        const academicYearId = req.params.academicYearId;
        const Data = await service.deleteByDataId(groupId,academicYearId);
        if (!Data) {
            res.status(199).json({ warning: 'Data not found to delete' });
        } else {
            res.status(201).json(Data);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
    //    classId:req.query.classId,
       name:req.query.name,
    //    courseId:req.query.courseId
    };
    const serviceResponse = await service.getAllDataByGroupId(groupId, criteria);
    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.put("/groupId/:groupId/academicYearId/:academicYearId",TokenService.checkPermission(["OSR"]), async (req, res) => {
    try {
        const academicYearId = req.params.academicYearId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const Data = await service.updateDataById(academicYearId, groupId, newData);
        if (!Data) {
            res.status(199).json({ warning: 'Data not found to update' });
        } else {
            res.status(201).json(Data);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get("/:id", async (req, res) => {
    const serviceResponse = await service.getById(req.params.id);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/academicYearId/:id", async (req, res) => {
    const serviceResponse = await service.getByDataId(req.params.id);
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

router.get("/getByYear/:year",TokenService.checkPermission(["OSR"]), async (req, res) => {
    try {
        const serviceResponse = await service.getByYear(req.params.year);
        requestResponsehelper.sendResponse(res, serviceResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
