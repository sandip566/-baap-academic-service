const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const AcademicYearModel = require("../schema/academicyear.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class AcademicYearService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getByDataId(academicYearId) {
        return this.execute(() => {
            return AcademicYearModel.findOne({
                academicYearId: academicYearId,
            });
        });
    }
   
    async getByacademicYearId(academicYearId) {
        return this.execute(() => {
            return AcademicYearModel.findOne({
                academicYearId: academicYearId,
            });
        });
    }
    async getByYear(year) {
        const data = await AcademicYearModel.findOne({ year: year });
        return data;
    }

    async updateDataById(academicYearId, groupId, newData) {
        try {
            if (newData.currentYear === true) {
                await AcademicYearModel.updateMany(
                    { groupId: groupId, currentYear: true },
                    { $set: { currentYear: false } }
                );
            }
            const updatedData = await AcademicYearModel.findOneAndUpdate(
                { academicYearId: Number(academicYearId), groupId: Number(groupId) },
                newData,
                { new: true }
            );
            return updatedData;
        } catch (error) {
            throw error;
        }
    }


    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.name) query.name = new RegExp(criteria.name, "i");
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async getByCourseIdAndGroupId(groupId, year) {
        const result = await this.model.findOne({
            groupId: groupId,
            year: year,
        });
        return new ServiceResponse({
            data: result,
        });
    }

    async updateCurrentYearFalseByGroupId(groupId) {
        const year = await AcademicYearModel.updateMany(
            { groupId: groupId },
            { $set: { currentYear: false } }
        )
        return year
    }

    async deleteByDataId(groupId, academicYearId) {
        try {
            const deleteData = await AcademicYearModel.deleteOne({
                groupId: groupId,
                academicYearId: academicYearId,
            });
            console.log(deleteData);
            return deleteData;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new AcademicYearService(AcademicYearModel, "academicyear");
