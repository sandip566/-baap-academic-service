const { default: mongoose } = require("mongoose");
const FeesModel = require("../schema/fees.schema");
const BaseService = require("@baapcompany/core-api/services/base.service")

class FeesService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

}

module.exports = new FeesService(FeesModel, "fees");