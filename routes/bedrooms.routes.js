const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/bedrooms.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const BedModel = require("../schema/bed.schema");
const BedRoomsModel = require("../schema/bedrooms.schema");

router.post(
    "/",
    checkSchema(require("../dto/bedrooms.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        
        const bedRoomId = +Date.now();
        req.body.bedRoomId = bedRoomId;
        
        const serviceResponse = await service.create(req.body);
        
        
        const beds = req.body.beds || [];
        for (const bed of beds) {
            if (bed.bedId) {
              
                await BedModel.updateOne({ bedId: bed.bedId }, { status: "Confirmed" });
            }
        }
        
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
router.get('/findData/bedCount', async (req, res) => {
  try {
    const groupId = req.query.groupId;
    const hostelId = req.query.hostelId;
    const roomId = req.query.roomId;

    const serviceResponse = await service.findavailableBed( hostelId, roomId,groupId);
    requestResponsehelper.sendResponse(res, serviceResponse);
  } catch (error) {
    console.error('Error retrieving available beds:', error);
    res.status(500).json({ error: 'An error occurred while retrieving available beds.' });
  }
});

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

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.limit) || 10;
    const criteria = {
        name: req.query.name,
        hostelId: req.query.hostelId,
        status: req.query.status,
        roomId:req.query.roomId,
        search:req.query.search
       
    };
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria,
        page,
        perPage
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.get(
    "/bedRoomId/:bedRoomId",
    async (req, res) => {
        const serviceResponse = await service.getByBedRoomId(req.params.bedRoomId);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
router.put("/groupId/:groupId/bedRoomId/:bedRoomId", async (req, res) => {
    try {
      const bedRoomId = req.params.bedRoomId;
      const groupId = req.params.groupId;
      const newData = req.body;
      const data = await service.updateByBedRoomId(bedRoomId, groupId, newData);
      if (!data) {
        res.status(404).json({ error: 'Asset not found to update' });
      } else {
        res.status(201).json(data);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  router.delete("/groupId/:groupId/bedRoomId/:bedRoomId", async (req, res) => {
    try {
      const bedRoomId = req.params.bedRoomId;
      const groupId = req.params.groupId;
      const data = await service.deleteByBedRoomId(bedRoomId, groupId);
      if (!data) {
        res.status(404).json({ error: 'Asset not found to delete' });
      } else {
        res.status(201).json(data);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
router.get("/all/bedRooms", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});

    requestResponsehelper.sendResponse(res, serviceResponse);
});

module.exports = router;
