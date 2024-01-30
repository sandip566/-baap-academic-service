const HostelModel = require("../schema/hostel.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class HostelService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getByDataId(hostelerId) {
        return this.execute(() => {
            return HostelModel.findOne({ hostelerId: hostelerId });
        });
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.admissionDate) query.admissionDate = criteria.admissionDate;
        if (criteria.admissionStatus) query.admissionStatus = new RegExp(criteria.admissionStatus, "i");
        if (criteria.bedNumber) query.bedNumber = criteria.bedNumber;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async updateDataById(hostelerId, groupId, newData) {
        try {
            const updatedData = await HostelModel.findOneAndUpdate({ hostelerId: hostelerId, groupId: groupId }, newData, { new: true });
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async deleteByDataId(hostelerId, groupId) {
        try {
            const deleteData = await HostelModel.deleteOne({ hostelerId: hostelerId, groupId: groupId });
            return deleteData;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new HostelService(HostelModel, 'hostel');
