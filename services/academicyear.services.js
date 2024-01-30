const AcademicYearModel = require("../schema/academicyear.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class AcademicYearService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async save(dataObject) {
        return await AcademicYearModel.create(dataObject);
    }

    async getByDataId(academicYearId) {
        return this.execute(() => {
            return AcademicYearModel.findOne({ academicYearId: academicYearId });
        });
    }

    async getByYear(year) {
        const data = await AcademicYearModel.findOne({ year: year });
        return data;
    }

    async updateDataById(academicYearId, groupId, newData) {
        try {
            const updatedData = await AcademicYearModel.findOneAndUpdate({ academicYearId: academicYearId, groupId: groupId }, newData, { new: true });
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async deleteByDataId(groupId,academicYearId) {
        try {
            const deleteData = await AcademicYearModel.deleteOne({ groupId: groupId, academicYearId: academicYearId });
            console.log(deleteData);
            return deleteData;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new AcademicYearService(AcademicYearModel, 'academicyear');
