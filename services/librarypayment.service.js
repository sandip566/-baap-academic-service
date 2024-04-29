const LibraryPaymentModel = require("../schema/librarypayment.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class LibraryPaymentService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        criteria.pageSize = 10;
        if (criteria.libraryPaymentId) query.libraryPaymentId = criteria.libraryPaymentId;
        if (criteria.empId) query.empId = criteria.empId;
        if (criteria.userId) query.userId = criteria.userId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteLibraryPaymentById(libraryPaymentId, groupId) {
        try {
            return await vendorModel.deleteOne(libraryPaymentId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateLibraryPaymentById(libraryPaymentId, groupId, newData) {
        try {
            const updateVendorData = await vendorModel.findOneAndUpdate(
                { libraryPaymentId: libraryPaymentId, groupId: groupId },
                newData,
                { new: true }
            );
            return updateVendorData;
        } catch (error) {
            throw error;
        }
    }


}

module.exports = new LibraryPaymentService(LibraryPaymentModel, 'librarypayment');
