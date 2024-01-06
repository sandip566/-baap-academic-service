const TransactionModel = require("../schema/transactions.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class TransactionService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async updateTransactionById(transactionId, groupId, newData) {
        try {
            const updatedData = await TransactionModel.findOneAndUpdate({ transactionId: transactionId, groupId: groupId }, newData, { new: true });
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async deleteByTransactionId(transactionId, groupId) {
        try {
            return await TransactionModel.deleteOne(transactionId, groupId);
        } catch (error) {
            throw error;
        }
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.vendorId) query.vendorId = criteria.vendorId;
        if (criteria.transactionId) query.transactionId = criteria.transactionId;
        return this.preparePaginationAndReturnData(query, criteria);
    }
}
module.exports = new TransactionService(TransactionModel, 'transactions');
