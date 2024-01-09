const VisitorModel = require("../schema/visitor.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class VisitorService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.vendorId) query.vendorId = criteria.vendorId;
        if (criteria.vendorName) query.vendorName = new RegExp(criteria.vendorName, "i");
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteVisitor(vendorId, groupId) { 
        try {
            return await this.dbModel.deleteOne({ visitorId: vendorId, groupId: groupId }); 
        } catch (error) {
            throw error;
        }
    }

    async updateVisitorId(visitorId, groupId, newData) {
        try {
            const updatedVisitor = await this.dbModel.findOneAndUpdate(
                { visitorId: visitorId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedVisitor;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new VisitorService(VisitorModel, 'visitor');
