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
        const query = {
            groupId: Number(groupId),
        };
        if (criteria.bedRoomId) query.bedRoomId = criteria.bedRoomId;
        if (criteria.hostelId) query.hostelId = criteria.hostelId;
        if (criteria.roomId) query.roomId = criteria.roomId;
        if (criteria.name) query.name = new RegExp(criteria.name, "i");
    
        const currentPage = page;
        const perPage = limit;
        const skip = (currentPage - 1) * perPage;
    
        try {
            const [data, totalItemsCount] = await Promise.all([
                BedRoomsModel.aggregate([
                    {
                      "$match":query
                    },
                    {
                      "$lookup": {
                        "from": "hostels",
                        "localField": "hostelId",
                        "foreignField": "hostelId",
                        "as": "hostelId"
                      }
                    },
                    { "$unwind": "$hostelId" } ,
                    {
                      "$lookup": {
                        "from": "rooms",
                        "localField": "roomId",
                        "foreignField": "roomId",
                        "as": "roomId"
                      }
                    },
                    { "$unwind": "$roomId" } 
                  ]
                  ).exec(),
                BedRoomsModel.countDocuments(query),
            ]);
    
            const response = {
                status: "Success",
                data: {
                    items: data,
                    totalItemsCount: totalItemsCount,
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
