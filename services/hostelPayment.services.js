const hostelPaymnetModel = require("../schema/hostelPaymnet.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class hostelPaymnetService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllHostelPaymnetByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        criteria.pageSize = 10;
        if (criteria.hostelPaymnetId)
            query.hostelPaymnetId = criteria.hostelPaymnetId;
        if (criteria.studentId) query.studentId = criteria.studentId;
        if (criteria.memberId) query.memberId = criteria.memberId;
        if (criteria.hostelId) query.hostelId = criteria.hostelId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteHostelPaymnetById(hostelPaymnetId, groupId) {
        try {
            return await hostelPaymnetModel.deleteOne(hostelPaymnetId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateHostelPaymnetById(hostelPaymnetId, groupId, newData) {
        try {
            const updateHostelPaymnet =
                await hostelPaymnetModel.findOneAndUpdate(
                    { hostelPaymnetId: hostelPaymnetId, groupId: groupId },
                    newData,
                    { new: true }
                );
            return updateHostelPaymnet;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new hostelPaymnetService(hostelPaymnetModel, "hostelPaymnet");
