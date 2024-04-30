const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/hostel.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/hostel.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const hostelId = +Date.now();
        req.body.hostelId = hostelId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});
    requestResponsehelper.sendResponse(res, serviceResponse);

});

router.delete("/groupId/:groupId/hostelId/:hostelId", async (req, res) => {
    try {
        const hostelId = req.params.hostelId;
        const groupId = req.params.groupId;
        const data = await service.deleteByDataId(hostelId, groupId);
        if (data.deletedCount === 0) {
            res.status(404).json({ error: "Data not found to delete" });
        } else {
            res.status(200).json({ message: "Data deleted successfully" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.put("/groupId/:groupId/hostelId/:hostelId", async (req, res) => {
    try {
        const hostelId = req.params.hostelId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const Data = await service.updateDataById(hostelId, groupId, newData);
        if (!Data) {
            res.status(404).json({ error: "Data not found to update" });
        } else {
            res.status(201).json({ Data, message: "deta update successfully" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        hosteladmissionDate: req.query.hosteladmissionDate,
        hosteladmissionStatus: req.query.hosteladmissionStatus,
        numberOfBeds: req.query.numberOfBeds,
        hostelId: req.query.hostelId,
        pageNumber: parseInt(req.query.pageNumber) || 1,
        pageSize: parseInt(req.query.pageSize) || 10,

    };
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/hostelId/:id", async (req, res) => {
    const serviceResponse = await service.getDataById(req.params.id);
    requestResponsehelper.sendResponse(res, serviceResponse);
});


router.get("/:id", async (req, res) => {
    const serviceResponse = await service.getById(req.params.id);
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
module.exports = router;
