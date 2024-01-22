const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/academicyear.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/academicyear.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const academicYearId = +Date.now();
        req.body.academicYearId = academicYearId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.delete("/groupId/:groupId/academicYearId/:academicYearId", async (req, res) => {
    try {
        const academicYearId = req.params.academicYearId;
        const groupId = req.params.groupId;
        const Data = await service.deleteByDataId(academicYearId, groupId);
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

router.put("/groupId/:groupId/academicYearId/:academicYearId", async (req, res) => {
    try {
        const academicYearId = req.params.academicYearId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const Data = await service.updateDataById(academicYearId, groupId, newData);
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

router.get("/getByYear/:year", async (req, res) => {
    try {
        const serviceResponse = await service.getByYear(req.params.year);
        requestResponsehelper.sendResponse(res, serviceResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get("/all/academicYears", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});
    requestResponsehelper.sendResponse(res, serviceResponse);
});
module.exports = router;
