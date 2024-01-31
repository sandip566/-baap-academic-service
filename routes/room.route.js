const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/room.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
  "/",
  checkSchema(require("../dto/room.dto")),
  async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
      return;
    }
    const roomId = +Date.now();
    req.body.roomId = roomId;
    const serviceResponse = await service.create(req.body);
    requestResponsehelper.sendResponse(res, serviceResponse);
  }
);

router.get("/all", async (req, res) => {
  const serviceResponse = await service.getAllByCriteria({});
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

router.get("/:id", async (req, res) => {
  const serviceResponse = await service.getById(req.params.id);
  requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/getAllRoom/groupId/:groupId", async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const criteria = {
      roomId: req.query.roomId,
      hostelId: req.query.hostelId,
      status: req.query.status,
    }
    const serviceResponse = await service.getAllRoomDataByGroupId(groupId, criteria);
    requestResponsehelper.sendResponse(res, serviceResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete("/groupId/:groupId/roomId/:roomId", async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const groupId = req.params.groupId;
    const roomData = await service.deleteRoomById(roomId, groupId);
    if (!roomData) {
      res.status(404).json({ error: 'Data not found to delete' });
    } else {
      res.status(201).json(roomData);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put("/groupId/:groupId/roomId/:roomId", async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const groupId = req.params.groupId;
    const newData = req.body;
    const updateRoom = await service.updateRoomById(roomId, groupId, newData);
    if (!updateRoom) {
      res.status(404).json({ error: 'Data not found to update' });
    } else {
      res.status(200).json(updateRoom);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
module.exports = router;
