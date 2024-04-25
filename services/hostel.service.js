const HostelModel = require("../schema/hostel.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const studentAddmissionModel=require('../schema/studentAdmission.schema.js');

class HostelService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
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
        if (criteria.hosteladmissionDate)
            query.hosteladmissionDate = criteria.hosteladmissionDate;
        if (criteria.hosteladmissionStatus)
            query.hosteladmissionStatus = new RegExp(criteria.hosteladmissionStatus, "i");
        if (criteria.numberOfBeds) query.numberOfBeds = criteria.numberOfBeds;
        if (criteria.hostelId) query.hostelId = criteria.hostelId;


        return this.preparePaginationAndReturnData(query, criteria);
    }

    async updateDataById(hostelId, groupId, newData) {
        try {
            const updatedData = await HostelModel.findOneAndUpdate(
                { hostelId: hostelId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async deleteByDataId(hostelId, groupId) {
        try {
            const deleteData = await HostelModel.deleteOne({
                hostelId: hostelId,
                groupId: groupId,
            });
            return deleteData;
        } catch (error) {
            throw error;
        }
    }  

}
module.exports = new HostelService(HostelModel, "hostel");
