const ConfigrationModel = require("../schema/configuration.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class ConfigrationService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.configrationId)
            query.configrationId = criteria.configrationId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteConfigrationById(configrationId, groupId) {
        try {
            return await ConfigrationModel.deleteOne(configrationId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateConfigrationById(configrationId, groupId, newData) {
        try {
            const updateConfigrationData =
                await ConfigrationModel.findOneAndUpdate(
                    { configrationId: configrationId, groupId: groupId },
                    newData,
                    { new: true }
                );
            return updateConfigrationData;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ConfigrationService(ConfigrationModel, "configuration");
