const SubjectMarksMapModel = require("../schema/subjectmarksmap.schema");
const SubjectModel = require("../schema/subjects.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class SubjectMarksMapService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getAllByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.subjectMarksMapId) query.subjectMarksMapId = criteria.subjectMarksMapId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteByDataId(subjectMarksMapId, groupId) {
        try {
            return await SubjectMarksMapModel.deleteOne(subjectMarksMapId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateByDataId(subjectMarksMapId, groupId, newData) {
        try {
            if (newData.subject && Array.isArray(newData.subject)) {
                newData.totalSubjects = newData.subject.length;
            }
            const updatedData = await SubjectMarksMapModel.findOneAndUpdate(
                { subjectMarksMapId: subjectMarksMapId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async getByDataId(subjectMarksMapId) {
        return this.execute(() => {
            return SubjectMarksMapModel.findOne({
                subjectMarksMapId: subjectMarksMapId,
            });
        });
    }

    async getAllSubject(groupId, criteria) {
        try {   
            const classId = criteria.classId;
            const semesterId = criteria.semesterId;
            const subjects = await SubjectModel.find({
                groupId: groupId,
                classId: classId,
                semesterId: semesterId,
            });
            return { status: "Success", data: subjects };
        } catch (error) {
            console.error("Error in getAllSubject:", error);
            throw error;
        }
    }
}

module.exports = new SubjectMarksMapService(SubjectMarksMapModel, 'subjectmarksmap');
