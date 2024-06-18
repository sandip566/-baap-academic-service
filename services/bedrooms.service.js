const BedRoomsModel = require("../schema/bedrooms.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class BedRoomsService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getByBedRoomId(bedRoomId) {
        return this.execute(() => {
            return BedRoomsModel.findOne({
                bedRoomId: bedRoomId,
            });
        });
    }
    async getAllDataByGroupId(groupId, criteria, page, limit, reverseOrder = true) {
        const searchFilter = {
            groupId: Number(groupId),
        };
        if (criteria.bedRoomId) searchFilter.bedRoomId = criteria.bedRoomId;
        if (criteria.hostelId) searchFilter.hostelId = criteria.hostelId;
        if (criteria.roomId) searchFilter.roomId = criteria.roomId;
        if (criteria.status) searchFilter.status = new RegExp(criteria.status, "i");
    
        const currentPage = page || 1;
        const perPage = limit || 10;
        const skip = (currentPage - 1) * perPage;
    
        try {
            const aggregationPipeline = [
                { $match: searchFilter },
                {
                    $lookup: {
                        from: "hostelpremises",
                        let: { hostelId: "$hostelId" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$hostelId", "$$hostelId"] } } }
                        ],
                        as: "hostelId"
                    }
                },
                { $unwind: { path: "$hostelId", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "rooms",
                        let: { roomId: "$roomId" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$roomId", "$$roomId"] } } }
                        ],
                        as: "roomId"
                    }
                },
                { $unwind: { path: "$roomId", preserveNullAndEmptyArrays: true } },
                ...(reverseOrder ? [{ $sort: { createdAt: -1 } }] : []),
                { $skip: skip },
                { $limit: perPage },
            ];
    
            if (criteria.search) {
                const searchRegex = new RegExp(criteria.search.trim(), "i");
                aggregationPipeline.push({
                    $match: {
                        $or: [
                            { bedRoomId: { $eq: parseInt(criteria.search) } },
                            { name: searchRegex },
                            { "roomId.hostelId": { $eq: parseInt(criteria.search) } },
                            { "roomId.status": searchRegex },
                            { "roomId.roomId": { $eq: parseInt(criteria.search) } },
                        ],
                    },
                });
            }
    
            const data = await BedRoomsModel.aggregate(aggregationPipeline);
            const totalItemsCount = await BedRoomsModel.countDocuments(searchFilter);
    
            const response = {
                status: "Success",
                data: {
                    items: data || [],
                    totalItemsCount: totalItemsCount || 0,
                },
            };
            return response;
        } catch (error) {
            return {
                status: "Error",
                message: error.message,
            };
        }
    }
    
    

    
    
    




    
    async updateByBedRoomId(bedRoomId, groupId, newData) {
        try {
            const updatedData = await BedRoomsModel.findOneAndUpdate(
                { bedRoomId: bedRoomId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async findavailableBed(hostelId, roomId, groupId) {
        try {
            let data = await BedRoomsModel.aggregate([
                {
                    $match: {
                        hostelId: Number(hostelId),
                        roomId: Number(roomId),
                        groupId: Number(groupId)
                    }
                },
                {
                    $unwind: "$beds"
                },
                {
                    $match: {
                        "beds.status": "available"
                    }
                },
                {
                    $lookup: {
                        from: "beds",
                        localField: "beds.bedId",
                        foreignField: "bedId",
                        as: "bedDetails"
                    }
                },
                {
                    $unwind: "$bedDetails"
                },
                {
                    $project: {
                        "_id": "$bedDetails._id",
                        "groupId": "$groupId",
                        "name": "$bedDetails.name",
                        "bedId": "$bedDetails.bedId",
                        "numberOfBed": "$bedDetails.numberOfBed",
                        "type": "$bedDetails.type",
                        "createdAt": "$bedDetails.createdAt",
                        "updatedAt": "$bedDetails.updatedAt",
                        "__v": "$bedDetails.__v",
                        "status": "$bedDetails.status"
                    }
                }
            ]);
            
            return { data };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    
    async deleteByBedRoomId(bedRoomId, groupId) {
        try {
            const deleteData = await BedRoomsModel.deleteOne({
                bedRoomId: bedRoomId,
                groupId: groupId,
            });
            return deleteData;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new BedRoomsService(BedRoomsModel, "bedrooms");
