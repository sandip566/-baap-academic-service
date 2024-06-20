const BaseService = require("@baapcompany/core-api/services/base.service");
const roomModel = require("../schema/rooms.schema");

class Service extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getAllRoomDataByGroupId(
        groupID,
        criteria,
        reverseOrder = true
    ) {
        try {
            const groupId = parseInt(groupID);
            if (isNaN(groupId)) {
                throw new Error("Invalid groupID");
            }

            const searchFilter = { groupId };
            const aggregationPipeline = [
                { $match: searchFilter },
                {
                    $lookup: {
                        from: "hostelpremises",
                        localField: "hostelId",
                        foreignField: "hostelId",
                        as: "hostel",
                    },
                },
                {
                    $unwind: {
                        path: "$hostel",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $lookup: {
                        from: "rooms",
                        localField: "roomId",
                        foreignField: "roomId",
                        as: "room",
                    },
                },
                {
                    $unwind: {
                        path: "$room",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                { $sort: { createdAt: reverseOrder ? -1 : 1 } },
            ];

            if (criteria.search) {
                const searchRegex = new RegExp(criteria.search.trim(), "i");
                aggregationPipeline.push({
                    $match: {
                        $or: [
                            { roomId: { $eq: parseInt(criteria.search) } },
                            { numberOfBed: { $eq: parseInt(criteria.search) } },
                            { "room.roomType": searchRegex },
                            { bedCount: { $eq: parseInt(criteria.search) } },
                            { name: searchRegex },
                            { "room.status": searchRegex },
                            { hostelId: { $eq: parseInt(criteria.search) } },
                            { floorNo: { $eq: parseInt(criteria.search) } },
                        ],
                    },
                });
            }
            const page = parseInt(criteria.page) || 1;
            const limit = parseInt(criteria.limit) || 10;
            aggregationPipeline.push(
                { $skip: (page - 1) * limit },
                { $limit: limit }
            );

            const data = await roomModel.aggregate(aggregationPipeline);
            const totalItemsCount = await roomModel.countDocuments(
                searchFilter
            );

            const response = {
                status: "Success",
                data: {
                    items: data,
                    totalItemsCount: totalItemsCount,
                },
            };

            return response;
        } catch (error) {
            console.error("Error in getAllRoomDataByGroupId:", error);
            throw new Error(
                "An error occurred while processing the request. Please try again later."
            );
        }
    }

    async deleteRoomById(roomId, groupId) {
        try {
            return await roomModel.deleteOne({
                roomId: roomId,
                groupId: groupId,
            });
        } catch (error) {
            throw error;
        }
    }

    async updateRoomById(roomId, groupId, newData) {
        try {
            const updateData = await roomModel.findOneAndUpdate(
                { roomId: roomId, groupId: groupId },
                newData,
                { new: true }
            );
            return updateData;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new Service(roomModel, "rooms");
