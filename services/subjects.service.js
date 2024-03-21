const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const SubjectModel = require("../schema/subjects.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class SubjectService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async updateSubjectById(subjectId, groupId, newData) {
        try {
            const updatedData = await SubjectModel.findOneAndUpdate({ subjectId: subjectId, groupId: groupId }, newData, { new: true });
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async getBySubjectIdAndGroupId(groupId, name,classId) {

        const result = await this.model.findOne({ groupId: groupId, name: name ,classId:classId});
        return new ServiceResponse({
            data: result
        })
    }

    async deleteBySubjectId(subjectId, groupId) {
        try {
            return await SubjectModel.deleteOne(subjectId, groupId);
        } catch (error) {
            throw error;
        }
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.subjectName) query.subjectName = new RegExp(criteria.subjectName, "i");
        if (criteria.subjectId) query.subjectId = criteria.subjectId;
        if (criteria.courseId) query.courseId = criteria.courseId;
        if (criteria.divisionId) query.divisionId = criteria.divisionId;
        if (criteria.classId) query.classId = criteria.classId;
        if (criteria.Department) query.Department = criteria.Department;
        return this.preparePaginationAndReturnData(query, criteria);
    }
}
module.exports = new SubjectService(SubjectModel, 'subject');
