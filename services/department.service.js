const DepartmentModel = require("../schema/department.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class DepartmentService extends BaseService {
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

    async deleteByDataId(departmentId, groupId) { 
        try {
            return await DepartmentModel.deleteOne({ departmentId: departmentId, groupId: groupId }); 
        } catch (error) {
            throw error;
        }
    }

    async updateDataById(departmentId, groupId, newData) {
        try {
            const updatedData = await DepartmentModel.findOneAndUpdate({ departmentId: departmentId, groupId: groupId }, newData, { new: true });
            return updatedData;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new DepartmentService(DepartmentModel, 'department');
