const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/department.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const TokenService = require("../services/token.services");
const departmentModel = require("../schema/department.schema");
const courseModel=require("../schema/courses.schema")

router.post(
    "/",
    checkSchema(require("../dto/department.dto")),
    //  TokenService.checkPermission(["EMD2"]),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const existingRecord = await service.getByCourseIdAndGroupId(req.body.groupId, req.body.departmentName, req.body.departmentHead);
        console.log(existingRecord);
        if (existingRecord.data) {
            return res.status(409).json({ error: "Name,Code  Already Exists." });
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

router.delete("/groupId/:groupId/departmentId/:departmentId",
 //TokenService.checkPermission(["EMD4"]), 
 async (req, res) => {
    try {
      const groupId = req.params.groupId;
      const departmentId = req.params.departmentId;
  
      const hasAssignedCourses = await courseModel.exists({ groupId, departmentId });
  
      if (hasAssignedCourses) {
        return res.status(401).json({ error: 'Department has assigned courses ' });
      }
  
      const data = await service.deleteByDataId(groupId, departmentId);
      res.status(201).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  


router.get("/all/getByGroupId/:groupId" , TokenService.checkPermission(["EMD1"]),
async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const criteria = {
            departmentName: req.query.departmentName,
            search: req.query.search,
            departmentHead:req.query.departmentHead,
            academicYearId:req.query.academicYearId
        };
        const searchFilter = service.getAllDataByGroupId(groupId, criteria);
        const departments = await departmentModel.find(searchFilter);
        res.json({
            status:"success",
            data:{
                items:departments,
                totalItemsCount:departments.length
            }

        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.put("/groupId/:groupId/departmentId/:departmentId", TokenService.checkPermission(["EMD3"]), async (req, res) => {
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

router.get("/:id", TokenService.checkPermission(["EMD1"]), async (req, res) => {
    const serviceResponse = await service.getById(req.params.id);
    requestResponsehelper.sendResponse(res, serviceResponse);
});
module.exports = router;
