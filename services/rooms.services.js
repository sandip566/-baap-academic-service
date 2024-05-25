const BaseService = require("@baapcompany/core-api/services/base.service");
const roomModel = require("../schema/rooms.schema");

class Service extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getAllRoomDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        criteria.pageSize = 10;
        if (criteria.roomId) query.roomId = criteria.roomId;
        if (criteria.floorNo) query.floorNo = criteria.floorNo;
        if (criteria.hostelId) query.hostelId = criteria.hostelId;
        if (criteria.status) query.status = new RegExp(criteria.status, "i");
        if (criteria.name) query.name = new RegExp(criteria.name, "i");

        return this.preparePaginationAndReturnData(query, criteria);
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
