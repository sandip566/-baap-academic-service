const PurchaseModel = require("../schema/purchase.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class PurchaseService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async updateTransactionById(purchaseId, groupId, newData) {
        try {
            const updatedData = await PurchaseModel.findOneAndUpdate({ purchaseId: purchaseId, groupId: groupId }, newData, { new: true });
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async deleteByTransactionId(purchaseId, groupId) {
        try {
            return await PurchaseModel.deleteOne(purchaseId, groupId);
        } catch (error) {
            throw error;
        }
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.vendorId) query.vendorId = criteria.vendorId;
        if (criteria.purchaseId) query.purchaseId = criteria.purchaseId;
        return this.preparePaginationAndReturnData(query, criteria);
    }
}

module.exports = new PurchaseService(PurchaseModel, 'purchase');
