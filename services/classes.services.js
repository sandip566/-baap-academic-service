const ClassModel = require("../schema/classes.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class ClassService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.name) query.name = new RegExp(criteria.name, "i");
        if (criteria.location) query.location = new RegExp(criteria.location, "i");
        if (criteria.courseId) query.courseId = new RegExp(criteria.courseId);
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteClassById(classId, groupId) {
        try {
            return await ClassModel.deleteOne({ classId: classId, groupId: groupId });
        } catch (error) {
            throw error;
        }
    }

    async updateClassById(classId, groupId, newData) {
        try {
            const updateClass = await ClassModel.findOneAndUpdate(
                { classId: classId, groupId: groupId },
                newData,
                { new: true }
            );
            return updateClass;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new ClassService(ClassModel, "class");
