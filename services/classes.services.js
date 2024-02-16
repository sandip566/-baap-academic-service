const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
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
        if (criteria.courseId) query.courseId = criteria.courseId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async getByCourseIdAndGroupId(groupId, name, courseId) {
        const result = await this.model.findOne({ groupId: groupId, name: name, courseId: courseId });
        return new ServiceResponse({
            data: result,
        });
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
