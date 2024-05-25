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
    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.bedRoomId) query.bedRoomId = criteria.bedRoomId;
        if (criteria.hostelId) query.hostelId = criteria.hostelId;
        if (criteria.roomId) query.roomId = criteria.roomId;
        if (criteria.name) query.name = new RegExp(criteria.name, "i");

        return this.preparePaginationAndReturnData(query, criteria);
    }
    async updateByBedRoomId(bedRoomId, groupId, newData) {
        try {
            const updatedData = await BedRoomsModel.findOneAndUpdate({ bedRoomId: bedRoomId, groupId: groupId }, newData, { new: true });
            return updatedData;
        } catch (error) {
            throw error;
        }
    }


    async deleteByBedRoomId(bedRoomId, groupId) {
        try {
            const deleteData = await BedRoomsModel.deleteOne({ bedRoomId: bedRoomId, groupId: groupId });
            return deleteData;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new BedRoomsService(BedRoomsModel, 'bedrooms');
