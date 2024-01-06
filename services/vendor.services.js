const BaseService = require("@baapcompany/core-api/services/base.service");
const vendorModel = require("../schema/vendor.schema");

class Service extends BaseService {
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

    async deleteVendorById(vendorId, groupId) {
        try {
            return await vendorModel.deleteOne(vendorId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateVendorById(vendorId, groupId, newData) {
        try {
            const updateVendorData = await vendorModel.findOneAndUpdate({ vendorId: vendorId, groupId: groupId }, newData, { new: true });
            return updateVendorData;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new Service(vendorModel, "vendor");
