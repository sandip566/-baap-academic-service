const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
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
        // if (criteria.vendorId) query.vendorId = criteria.vendorId;
        if (criteria.departmentName) query.departmentName = new RegExp(criteria.departmentName, "i");
        return this.preparePaginationAndReturnData(query, criteria);
    }
    
    async getByCourseIdAndGroupId(groupId, departmentName, departmentHead) {
        const codeValue = departmentHead.code instanceof Object ? departmentHead.code.code : departmentHead.code;
      
        const result = await this.model.findOne({
          groupId: groupId,
          'departmentHead.code': codeValue,
        });
      
        return new ServiceResponse({
          data: result,
        });
      }
      
    // async getByCourseIdAndGroupId(groupId, departmentName, departmentHead) {
    //     let code = departmentHead.code;
    //     const result = await this.model.findOne({ groupId: groupId, departmentName: departmentName,code: code});
    //     // const codeResult = await this.model.findOne({ groupId: groupId, code: code });
    //     return new ServiceResponse({
    //         data: result,
    //         // code: codeResult
    //     });
    // }
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
