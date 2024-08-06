const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/hostelPremises.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const hostelData = require("../schema/hostelPremises.schema");
const hostelPremisesModel = require("../schema/hostelPremises.schema")
const hostelPremisesService = require("../services/hostelPremises.service");
router.post(
    "/",
    checkSchema(require("../dto/hostelPremises.dto")),
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
router.get("/getHostelId/:hostelId", async (req, res) => {
    const serviceResponse = await service.getByHostelId(req.params.hostelId);
    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        hostelId: req.query.hostelId,
        search: req.query.search,
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

router.get("/get-hostel-floors/:hostelId", async (req, res) => {
    const hostelId = parseInt(req.params.hostelId);
    if (!hostelId) {
        return res.status(400).json({ error: "Hostel ID is required" });
    }
    const hostel = await hostelData.aggregate([
        { $match: { hostelId: parseInt(hostelId) } },
    ]);
    if (!hostel) {
        return res.status(404).json({ error: "Hostel not found" });
    }
    const floors = [];
    for (let i = 1; i <= hostel[0].numberOfFloors; i++) {
        floors.push({ label: `Floor ${i}`, value: i, hostelId: hostelId });
    }
    res.json({ floors });
});

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const hostelId = req.body.hostel;

        if (!Array.isArray(hostelId) || hostelId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty hostelId array",
            });
        }

        const numericIds = hostelId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${hostelId}`);
            }
            return num;
        });

        const result = await hostelPremisesModel.deleteMany({
            groupId: groupId,
            hostelId: { $in: numericIds },
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "No records found to delete",
            });
        }

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} records deleted successfully`,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
});
module.exports = router;
