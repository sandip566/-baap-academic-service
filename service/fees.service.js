const { default: mongoose } = require("mongoose");
const FeesModel = require("../schema/fees.schema");
const BaseService = require("@baapcompany/core-api/services/base.service")

class FeesService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getFeesByParams(groupId, memberId, feesType) {
        const query = {
            groupId: groupId,
            memberId: memberId
        };
    
        if (feesType) {
            query.feesType = feesType;
        }
        console.log(query);
        return this.getAllByCriteria(query);
    }

}

module.exports = new FeesService(FeesModel, "fees");