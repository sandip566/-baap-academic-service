const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/configuration.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const ConfigurationModel = require("../schema/configuration.schema");

router.post(
    "/",
    checkSchema(require("../dto/configuration.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const configurationId = Date.now()
        req.body.configurationId = configurationId;
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

router.get("/all/configration", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        configurationId: req.query.configurationId,
    };
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/groupId/:groupId/configurationId/:configurationId", async (req, res) => {
    try {
        const configurationId = req.params.configurationId
        const groupId = req.params.groupId
        const Data = await service.deleteConfigurationById(configurationId, groupId);
        if (!Data) {
            res.status(404).json({ error: 'configuration data not found to delete' });
        } else {
            res.status(201).json(Data);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put("/groupId/:groupId/configurationId/:configurationId", async (req, res) => {
    try {
        const configurationId = req.params.configurationId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const updateData = await service.updateConfigurationById(configurationId, groupId, newData);
        if (!updateData) {
            res.status(404).json({ error: 'data not found to update' });
        } else {
            res.status(200).json(updateData);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const configurationId = req.body.configuration;

        if (!Array.isArray(configurationId) || configurationId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty configurationId array",
            });
        }

        const numericIds = configurationId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${configurationId}`);
            }
            return num;
        });

        const result = await ConfigurationModel.deleteMany({
            groupId: groupId,
            configurationId: { $in: numericIds },
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
