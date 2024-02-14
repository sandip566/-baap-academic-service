const BaseService = require("@baapcompany/core-api/services/base.service");
const feesTemplateModel = require("../schema/feesTemplate.schema");

class Service extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        criteria.pageSize = 10;
        if (criteria.feesTemplateId) query.feesTemplateId = criteria.feesTemplateId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deletefeesTemplateById(feesTemplateId, groupId) {
        try {
            return await feesTemplateModel.deleteOne(feesTemplateId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updatefeesTemplateById(feesTemplateId, groupId, newData) {
        try {
            const updatefeesTemplate = await feesTemplateModel.findOneAndUpdate({ feesTemplateId: feesTemplateId, groupId: groupId }, newData, { new: true });
            return updatefeesTemplate;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new Service(feesTemplateModel, "feesTemplate");
