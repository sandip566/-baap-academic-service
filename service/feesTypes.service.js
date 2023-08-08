const { default: mongoose } = require("mongoose");
const FeesTypesModel = require("../schema/feesTypes.schema");
const BaseService = require("@baapcompany/core-api/services/base.service")

class FeesTypesService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async createFeesType(feesTypeData) {
        return this.create(feesTypeData);
    }

    async getFeesTypesByParams(groupId, feesType) {
        const query = {
            groupId: groupId
        };
    
        if (feesType) {
            query.feesType = feesType;
        }
        return this.getAllByCriteria(query);
    }
}

module.exports = new FeesTypesService(FeesTypesModel, "feesTypes");