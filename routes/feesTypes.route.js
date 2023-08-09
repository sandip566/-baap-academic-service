const express = require('express');
const router = express.Router();
const feesTypesService = require('../service/feesTypes.service');

router.post("/academic/api/fees-types", async (req, res) => {
    const feesTypeData = req.body;

    try {
        const response = await feesTypesService.createFeesType(feesTypeData);
        const serviceResponse = response.data;
        res.status(200).json({
            message: "Data added successfully",
            data: serviceResponse,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
});

router.get("/academic/api/fees-types/summary/group/:groupId", async (req, res) => {
    
    const groupId = req.params.groupId;
    const feesType = req.query.feesType;

    try {
        const response = await feesTypesService.getFeesTypesByParams(groupId, feesType);
        const feesTypeData = response.data.items;
        res.status(200).json({
            message: "Data fetch successfully",
            data: feesTypeData,
            totalItemsCount: response.data.totalItemsCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
});


module.exports = router;