const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/department.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/department.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const existingRecord = await service.getByCourseIdAndGroupId(req.body.groupId,req.body.departmentName,req.body.departmentHead.code);
        console.log(existingRecord);
        if (existingRecord.data) {
           
            return res.status(404).json({ error: "Name,Code With The Same GroupId Already Exists." });
        }
        if (existingRecord.data.code) {
           
            return res.status(404).json({ error: "Code With The Same GroupId Already Exists." });
        }
        const departmentId = +Date.now();
        req.body.departmentId = departmentId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/groupId/:groupId/departmentId/:departmentId", async (req, res) => {
    try {
        const departmentId = req.params.departmentId;
        const groupId = req.params.groupId;
        const Data = await service.deleteByDataId(departmentId, groupId);
        if (!Data) {
            res.status(404).json({ error: 'Data not found to delete' });
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
       departmentName:req.query.departmentName,
    //    name:req.query.name,
    //    courseId:req.query.courseId
    };
    const serviceResponse = await service.getAllDataByGroupId(groupId, criteria);
    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.put("/groupId/:groupId/departmentId/:departmentId", async (req, res) => {
    try {
        const departmentId = req.params.departmentId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const Data = await service.updateDataById(departmentId, groupId, newData);
        
        if (!Data) {
            res.status(404).json({ error: 'Data not found to update' });
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

module.exports = router;
