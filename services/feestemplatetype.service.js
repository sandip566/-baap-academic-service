const FeesTemplateTypeModel = require("../schema/feestemplatetype.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class FeesTemplateTypeService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getByFeesTemplateTypeId(feesTemplateTypeId) {
        return this.execute(() => {
            return FeesTemplateTypeModel.findOne({
                feesTemplateTypeId: feesTemplateTypeId,
            });
        });
    }
    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.feesTemplateTypeId) query.feesTemplateTypeId = criteria.feesTemplateTypeId;
        if (criteria.name) query.name = new RegExp(criteria.name, "i");

        return this.preparePaginationAndReturnData(query, criteria);
    }
    async updateByFeesTemplateTypeId(feesTemplateTypeId, groupId, newData) {
        try {
            const updatedData = await FeesTemplateTypeModel.findOneAndUpdate({ feesTemplateTypeId: feesTemplateTypeId, groupId: groupId }, newData, { new: true });
            return updatedData;
        } catch (error) {
            throw error;
        }
    }


    async deleteByFeesTemplateTypeId(feesTemplateTypeId, groupId) {
        try {
            const deleteData = await FeesTemplateTypeModel.deleteOne({ feesTemplateTypeId: feesTemplateTypeId, groupId: groupId });
            return deleteData;
        } catch (error) {
            throw error;
        }
    }

}

module.exports = new FeesTemplateTypeService(FeesTemplateTypeModel, 'feestemplatetype');
