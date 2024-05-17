const HostelAdmissionModel = require("../schema/hosteladmission.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class HostelAdmissionService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };

        if (criteria.hostelAdmissionId) query.hostelAdmissionId = criteria.hostelAdmissionId;

        return this.preparePaginationAndReturnData(query, criteria);
    }
    async getByHostelId(hostelAdmissionId) {
        return this.execute(() => {
            return HostelAdmissionModel.findOne({
                hostelAdmissionId: hostelAdmissionId,
            });
        });
    }
    async getByAddmissionIdData(hostelAdmissionId) {
        return this.execute(() => {
            return this.model.findOne({ hostelAdmissionId: hostelAdmissionId });
        });
    }
    async updateUser(hostelAdmissionId, groupId, data) {
        try {
            const resp = await 
            hostelfeesInstallmentModel.findOneAndUpdate(
                { hostelAdmissionId: hostelAdmissionId, groupId: groupId },

                data,
                { upsert: true, new: true }
            );

            return new ServiceResponse({
                data: resp,
            });
        } catch (error) {
            return new ServiceResponse({
                isError: true,
                message: error.message,
            });
        }
    }
    async updateDataById(hostelAdmissionId, groupId, newData) {
        try {
            const updatedData = await HostelAdmissionModel.findOneAndUpdate(
                { hostelAdmissionId: hostelAdmissionId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async deleteByDataId(hostelAdmissionId, groupId) {
        try {
            const deleteData = await HostelAdmissionModel.deleteOne({
                hostelAdmissionId: hostelAdmissionId,
                groupId: groupId,
            });
            return deleteData;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new HostelAdmissionService(HostelAdmissionModel, 'hosteladmission');
