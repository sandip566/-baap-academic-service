const BaseService = require("@baapcompany/core-api/services/base.service");
const religionModel = require("../schema/religion.schema");
const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");

class Service extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getByCourseIdAndGroupId(groupId,name) {
        const result = await this.model.findOne({groupId:groupId, religion: name });
        return new ServiceResponse({
            data: result,
        });
    }
    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        criteria.pageSize = 10;
        if (criteria.religionId) query.religionId = criteria.religionId;
        if (criteria.categoriesId) query.categoriesId = criteria.categoriesId;
        if (criteria.name) query.name = new RegExp(criteria.name, "i");
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteReligionById(religionId) {
        try {
            return await religionModel.deleteOne(religionId);
        } catch (error) {
            throw error;
        }
    }

    async updateReligionById(religionId, newData) {
        try {
            const updateData = await religionModel.findOneAndUpdate({ religionId: religionId }, newData, { new: true });
            return updateData;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new Service(religionModel, "religion");
