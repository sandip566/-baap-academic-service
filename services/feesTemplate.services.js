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
        if (criteria.feesTemplateId)
            query.feesTemplateId = criteria.feesTemplateId;
        if (criteria.isHostel)
            query.isHostel = criteria.isHostel;
        if (criteria.type)
            query.type = criteria.type;
        if (criteria.isShowInAccounting)
            query.isShowInAccounting = criteria.isShowInAccounting;
        return this.preparePaginationAndReturnData(query, criteria);
    }
    async getByfeesTemplateId(feesTemplateId) {
        const result = await this.model.findOne({ feesTemplateId });
        return new ServiceResponse({
            data: result,
        });
    }

    async deletefeesTemplateById(groupId, feesTemplateId) {
        try {
            return await feesTemplateModel.deleteOne({
                groupId: groupId,
                feesTemplateId: feesTemplateId,
            });
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
