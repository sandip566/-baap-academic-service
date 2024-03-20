const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const DepartmentModel = require("../schema/department.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const ClassModel = require("../schema/classes.schema");
const DivisionModel = require("../schema/division.schema");
const courseModel = require("../schema/courses.schema");

class DepartmentService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        try {
            const searchFilter = {
                groupId: groupId,
            };

            if (criteria.search) {
                const numericSearch = parseInt(criteria.search);
                if (!isNaN(numericSearch)) {

                    searchFilter.$or = [
                        { academicYearId: numericSearch },
                        { departmentId: numericSearch }
                    ];
                } else {
                    searchFilter.$or = [
                        { departmentHead: { $regex: criteria.search, $options: "i" } },
                        { departmentName: { $regex: criteria.search, $options: "i" } },

                    ];
                }
            }

            if (criteria.academicYearId) {
                searchFilter.academicYearId = criteria.academicYearId;
            }

            return searchFilter;
        } catch (error) {
            console.log(error);
            return null;
        }
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
    async deleteByDataId( groupId,departmentId) {
        try {

            const classRecord = await ClassModel.findOne({  groupId: groupId ,Department: departmentId, });
            const courseRecord = await courseModel.findOne({  groupId: groupId ,departmentId: departmentId, });
            const divisionRecord = await DivisionModel.findOne({  groupId: groupId ,Department: departmentId, });


            if (classRecord ||divisionRecord || courseRecord) {
                return null;
            }


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
