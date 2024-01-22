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
        if (criteria.visitorId) query.visitorId = criteria.visitorId;
        if (criteria.visitorName) query.visitorName = new RegExp(criteria.visitorName, "i");
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteVisitor(vendorId, groupId) {
        try {
            return await this.dbModel.deleteOne({ visitorId: visitorId, groupId: groupId }); 
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

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.visitorId) query.visitorId = criteria.visitorId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteVendorById(visitorId, groupId) {
        try {
            return await VisitorModel.deleteOne(visitorId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateVisitorById(visitorId, groupId, newData) {
        try {
            const updateVisitorData = await VisitorModel.findOneAndUpdate({ visitorId: visitorId, groupId: groupId }, newData, { new: true });
            return updateVisitorData;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new VisitorService(VisitorModel, 'visitor');
