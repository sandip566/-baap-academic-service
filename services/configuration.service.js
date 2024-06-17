const ConfigurationModel = require("../schema/configuration.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class ConfigurationService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.configurationId)
            query.configurationId = criteria.configurationId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteConfigurationById(configurationId, groupId) {
        try {
            const deletedData = await ConfigurationModel.deleteOne({ configurationId: configurationId, groupId: groupId });
            return deletedData;
        } catch (error) {
            throw error;
        }
    }

    async updateConfigurationById(configurationId, groupId, newData) {
        try {
            const updateConfigurationData = await ConfigurationModel.findOneAndUpdate(
                { configurationId: configurationId, groupId: groupId },
                newData,
                { new: true }
            );
            return updateConfigurationData;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ConfigurationService(ConfigurationModel, "configuration");
