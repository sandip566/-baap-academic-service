const TravellerStopModel = require("../schema/travellerstop.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const BusRoutesModel = require("../schema/busroutes.schema");
const driverModel = require("../schema/driver.schema");

class TravellerStopService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
}

module.exports = new TravellerStopService(TravellerStopModel, "travellerstop");
