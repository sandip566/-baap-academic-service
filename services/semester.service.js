const SemesterModel = require("../schema/semester.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class SemesterService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };

        if (criteria.name) query.name = new RegExp(criteria.name, "i");

        return this.preparePaginationAndReturnData(query, criteria);
    }
}

module.exports = new SemesterService(SemesterModel, "semester");
