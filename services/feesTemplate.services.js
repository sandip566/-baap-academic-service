const BaseService = require("@baapcompany/core-api/services/base.service");
const feesTemplateModel = require("../schema/feesTemplate.schema");
const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");

class Service extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        criteria.pageSize = 5;
        if (criteria.feesTemplateId) query.feesTemplateId = criteria.feesTemplateId;
        return this.preparePaginationAndReturnData(query, criteria);
    }
    async getByfeesTemplateId(feesTemplateId) {
        const result = await this.model.findOne({ feesTemplateId});
        return new ServiceResponse({
            data: result,
        });
    }

    async deletefeesTemplateById(groupId, feesTemplateId) {
        try {
            return await feesTemplateModel.deleteOne({ groupId: groupId, feesTemplateId: feesTemplateId });
        } catch (error) {
            throw error;
        }
    }

    async updatefeesTemplateById(feesTemplateId, groupId, newData) {
        try {
            const updatefeesTemplate = await feesTemplateModel.findOneAndUpdate(
                { feesTemplateId: feesTemplateId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatefeesTemplate;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new Service(feesTemplateModel, "feesTemplate");
