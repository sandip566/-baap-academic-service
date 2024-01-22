const BaseService = require("@baapcompany/core-api/services/base.service");
const relegionModel = require("../schema/relegion.schema");

class Service extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.relegionId) query.relegionId = criteria.relegionId;
        if (criteria.name) query.name = new RegExp(criteria.name, "i");
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteRelegionById(relegionId) {
        try {
            return await relegionModel.deleteOne(relegionId);
        } catch (error) {
            throw error;
        }
    }

    async updateRelegionById(relegionId,newData) {
        try {
            const updateData = await relegionModel.findOneAndUpdate({ relegionId: relegionId }, newData, { new: true });
            return updateData;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new Service(relegionModel, "relegion");
