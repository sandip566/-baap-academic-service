const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/caretaker.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const CareTakerModel = require("../schema/caretaker.schema");

router.post(
    "/",
    checkSchema(require("../dto/caretaker.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const { empId, groupId } = req.body;
        const existingUser = await service.findByUserId(groupId, empId);
        if (existingUser) {
            return res.status(400).json({ error: "This user is already exists" });
        }
        const careTakerId = +Date.now();
        req.body.careTakerId = careTakerId
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

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

router.get("/all/careTaker", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/getcareTakerId/:careTakerId", async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }
    const serviceResponse = await service.getBycareTakerId(req.params.careTakerId);

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    let { phoneNumber, name, search, page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit);
    const serviceResponse = await service.getAllDataByGroupId(
        groupId, phoneNumber, name, search, page, limit
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/groupId/:groupId/careTakerId/:careTakerId", async (req, res) => {
    try {
        const careTakerId = req.params.careTakerId;
        const groupId = req.params.groupId;
        const Data = await service.deleteTripHistroyById({
            careTakerId: careTakerId,
            groupId: groupId,
        });
        if (!Data) {
            res.status(404).json({ error: "careTaker data not found to delete" });
        } else {
            res.status(201).json(Data);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/groupId/:groupId/careTakerId/:careTakerId", async (req, res) => {
    try {
        const careTakerId = req.params.careTakerId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const updateData = await service.updatecareTakerById(
            careTakerId,
            groupId,
            newData
        );
        if (!updateData) {
            res.status(404).json({ error: "data not found to update" });
        } else {
            res.status(200).json(updateData);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const careTakerId = req.body.careTaker;

        if (!Array.isArray(careTakerId) || careTakerId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty careTakerId array",
            });
        }

        const numericIds = careTakerId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${careTakerId}`);
            }
            return num;
        });

        const result = await CareTakerModel.deleteMany({
            groupId: groupId,
            careTakerId: { $in: numericIds },
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
