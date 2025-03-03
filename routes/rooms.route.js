const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/rooms.services");
const RoomsModel = require("../schema/rooms.schema");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const roomModel = require("../schema/rooms.schema");

router.post(
    "/",
    checkSchema(require("../dto/rooms.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const existingRoom = await RoomsModel.findOne({
            groupId: req.body.groupId,
            hostelId: req.body.hostelId,
            floorNo: req.body.floorNo,
        });

        if (existingRoom) {
            return res
                .status(400)
                .json({ error: "Rooms Already Exist For This Hostel,Floor" });
        }

        const floorNo = req.body.floorNo;
        const numberOfRooms = req.body.numberOfRooms;
        const assignRoomNumber = req.body.assignRoomNumber;

        const [startRoom, endRoom] = assignRoomNumber.split("-").map(Number);

        const roomsData = [];
        for (let i = startRoom; i <= endRoom; i++) {
            const roomId = Date.now() + Math.floor(Math.random() * 1000000);
            const roomData = {
                roomId: roomId,
                floorNo: floorNo,
                roomNo: i,
                ...req.body,
            };
            roomsData.push(roomData);
        }

        const serviceResponse = await service.create(roomsData);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all", async (req, res) => {
    const pagination = {
        pageNumber: req.query.pageNumber || 1,
        pageSize: 10,
    };
    const { pageNumber, pageSize, ...query } = req.query;
    const serviceResponse = await service.getAllByCriteria({
        req,
        query,
        pagination,
    });
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
            floorNo: req.query.floorNo,
            name: req.query.name,
            hostelId: req.query.hostelId,
            status: req.query.status,
            roomType: req.query.roomType,
            bedCount: req.query.bedCount,
            search: req.query.search,
            page: req.query.page,
            limit: req.query.limit,
        };
        const serviceResponse = await service.getAllRoomDataByGroupId(
            groupId,
            criteria
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete("/groupId/:groupId/roomId/:roomId", async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const groupId = req.params.groupId;
        const roomData = await service.deleteRoomById(roomId, groupId);
        if (!roomData) {
            res.status(404).json({ error: "Data not found to delete" });
        } else {
            res.status(201).json(roomData);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const roomId = req.body.rooms;

        if (!Array.isArray(roomId) || roomId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty roomId array",
            });
        }

        const numericIds = roomId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${roomId}`);
            }
            return num;
        });

        const result = await roomModel.deleteMany({
            groupId: groupId,
            roomId: { $in: numericIds },
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
router.put("/groupId/:groupId/roomId/:roomId", async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const updateRoom = await service.updateRoomById(
            roomId,
            groupId,
            newData
        );
        if (!updateRoom) {
            res.status(404).json({ error: "Data not found to update" });
        } else {
            res.status(200).json(updateRoom);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
module.exports = router;
