const DocumentModel = require("../schema/document.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class DocumentService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.roleId) query.roleId = criteria.roleId;
        if (criteria.name) query.name = new RegExp(criteria.name, "i");
        if (criteria.description) query.description = criteria.description;
        return this.preparePaginationAndReturnData(query, criteria);
    }
}

module.exports = new DocumentService(DocumentModel, 'document');
