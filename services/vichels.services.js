const vichelsModel = require("../schema/vichels.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class vichelservice extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

 async   getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.vichelsId) query.vichelsId = criteria.vichelsId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteTripHistroyById(vichelsId, groupId) {
        try {
            return await vichelsModel.deleteOne(
                vichelsId,
                groupId
            );
        } catch (error) {
            throw error;
        }
    }

    async updatevichelsById(vichelsId, groupId, newData) {
        try {
            const updatedVisitor = await vichelsModel.findOneAndUpdate(
                { vichelsId: vichelsId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedVisitor;
        } catch (error) {
            throw error;
        }
    }

   
}
module.exports = new vichelservice(vichelsModel, "vichels");
