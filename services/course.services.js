const courseModel = require("../schema/course.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class CourseService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.name) query.name = new RegExp(criteria.name, "i");
        if (criteria.location) query.location = new RegExp(criteria.location, "i");
        if (criteria.phone) query.phone = new RegExp(criteria.phone);
        if (criteria.name) query.name = new RegExp(criteria.name, "i");
        return this.preparePaginationAndReturnData(query, criteria);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.location) query.location = new RegExp(criteria.location, "i");
        if (criteria.phone) query.phone = criteria.phone;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteCourseById(courseId, groupId) {
        try {
            return await courseModel.deleteOne(courseId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateCourseById(courseId, groupId, newData) {
        try {
            const updateCourse = await courseModel.findOneAndUpdate(
                { courseId: courseId, groupId: groupId },
                newData,
                { new: true }
            );
            return updateCourse;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new CourseService(courseModel, "course");
