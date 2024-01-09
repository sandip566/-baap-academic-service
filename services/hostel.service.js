const HostelModel = require("../schema/hostel.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class HostelService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async save(dataObject) {
        return await HostelModel.create(dataObject);
    }

    async getByDataId(hostelId) {
        return this.execute(() => {
            return HostelModel.findOne({ hostelId: hostelId });
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

    async updateDataById(hostelId, groupId, newData) {
        try {
            const updatedData = await HostelModel.findOneAndUpdate({ hostelId: hostelId, groupId: groupId }, newData, { new: true });
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async deleteByDataId(hostelId, groupId) {
        try {
            const deleteData = await HostelModel.deleteOne({ hostelId: hostelId, groupId: groupId });
            return deleteData;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new HostelService(HostelModel, 'hostel');
