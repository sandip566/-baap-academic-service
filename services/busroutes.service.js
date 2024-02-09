const BusRoutesModel = require("../schema/busroutes.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class BusRoutesService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
}

module.exports = new BusRoutesService(BusRoutesModel, 'busroutes');
