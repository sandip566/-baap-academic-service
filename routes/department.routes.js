const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/department.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const TokenService = require("../services/token.services");
const departmentModel = require("../schema/department.schema");
const courseModel=require("../schema/courses.schema")
const multer = require("multer");
const upload = multer();
const xlsx = require("xlsx");

router.post(
    "/",
    checkSchema(require("../dto/department.dto")),  TokenService.checkPermission(["EMD2"]),
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

router.delete("/groupId/:groupId/departmentId/:departmentId",TokenService.checkPermission(["EMD4"]), async (req, res) => {
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
  


router.get("/all/getByGroupId/:groupId", TokenService.checkPermission(["EMD1"]),
    async (req, res) => {
        try {
            const groupId = req.params.groupId;
            const criteria = {
                departmentName: req.query.departmentName,
                search: req.query.search,
                departmentHead: req.query.departmentHead,
                academicYearId: req.query.academicYearId
            };
            const searchFilter = service.getAllDataByGroupId(groupId, criteria);
            const departments = await departmentModel.find(searchFilter);
            res.json({
                status: "success",
                data: {
                    items: departments,
                    totalItemsCount: departments.length
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

router.post('/bulkUploadDepartment', upload.single('excelFile'), async (req, res) => {

    if (!req.file) {    
        return res.status(400).send('No file uploaded.');
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    const headers = jsonData[0];

    const uploadedData = [];

    for (let i = 1; i < jsonData.length; i++) {

        const departmentId = +Date.now();
        const row = jsonData[i];
        const data = createDepartmentDataObject(headers, row);

        if (row.every(value => value === null || value === '')) {
            continue;
        }

        data.departmentId = departmentId;

        if (data && Object.keys(data).length > 0) {
            const result = await service.bulkUploadDepartment(data);
            uploadedData.push(result);
        }
    }
    console.log(uploadedData)

    res.status(200).json({
        message: 'File uploaded and processed successfully.',
        uploadedData: uploadedData,

    });
});



function createDepartmentDataObject(headers, row) {
    const data = {};
    for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        const value = row[i];

        if (header === 'groupId' && !isNaN(value) && value !== undefined) {
            data[header] = Number(value);
        } else if (header === 'name' && value !== undefined) {
            data[header] = value;
        } else if (value !== undefined) {
            data[header] = value;
        }
    }
    return data;
}

module.exports = router;
