const ModulesModel = require("../schema/modules.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class ModulesService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        criteria.pageSize = 10;
        if (criteria.name) query.name = new RegExp(criteria.name, "i");
        return this.preparePaginationAndReturnData(query, criteria);
    }

}

module.exports = new ModulesService(ModulesModel, 'modules');
