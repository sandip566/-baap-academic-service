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
        return this.preparePaginationAndReturnData(query, criteria);
    }
}
module.exports = new SubjectService(SubjectModel, 'subject');
