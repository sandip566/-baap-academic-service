const courseModel = require("../schema/courses.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class CourseService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.CourseName) query.CourseName = new RegExp(criteria.CourseName, "i");
        if (criteria.University) query.University = new RegExp(criteria.University, "i");
        if (criteria.courseId) query.courseId = criteria.courseId;
        return this.preparePaginationAndReturnData(query, criteria);
    }
    async getByCourseId(courseId) {
        const result = await this.model.findOne({ courseId });
        return new serviceResponse({
            data: result,
        });
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
