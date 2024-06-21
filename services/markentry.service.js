const MarkEntryModel = require("../schema/markentry.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class MarkEntryService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
}

module.exports = new MarkEntryService(MarkEntryModel, 'markentry');
