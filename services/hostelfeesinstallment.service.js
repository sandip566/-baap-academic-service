const HostelFeesInstallmentModel = require("../schema/hostelfeesinstallment.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class HostelFeesInstallmentService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getAllHostelFeesInstallmentByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };

        criteria.pageSize = 10;
        if (criteria.studentId) query.studentId = criteria.studentId;
        if (criteria.installmentId)
            query.installmentId = criteria.installmentId;
        if (criteria.empId) query.empId = criteria.empId;
        if (criteria.installmentNo)
            query.installmentNo = criteria.installmentNo;
        return this.preparePaginationAndReturnData(query, criteria);
    }
    async updateUser(hostelAdmissionId, groupId, data) {
        try {
            const resp = await HostelFeesInstallmentModel.findOneAndUpdate(
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
}

module.exports = new HostelFeesInstallmentService(HostelFeesInstallmentModel, 'hostelfeesinstallment');
