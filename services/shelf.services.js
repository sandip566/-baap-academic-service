
const BaseService = require("@baapcompany/core-api/services/base.service");
const ShelfModel = require("../schema/shelf.schema");

class ShelfService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.shelfId) query.shelfId = criteria.shelfId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteShelfById(shelfId, groupId) {
        try {
            return await ShelfModel.deleteOne(shelfId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateShelfById(shelfId, groupId, newData) {
        try {
            const updateShelfData = await ShelfModel.findOneAndUpdate({ shelfId: shelfId, groupId: groupId }, newData, { new: true });
            return updateShelfData;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new ShelfService(ShelfModel, 'shelf');
