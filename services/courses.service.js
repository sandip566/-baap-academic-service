const courseModel = require("../schema/courses.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const DepartmentModel = require("../schema/department.schema");
const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
class CourseService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getAllDataByGroupId(groupId, criteria) {
        try {
            const query = {
                groupId: groupId,
            };
    
            if (criteria.CourseName)
                query.CourseName = new RegExp(criteria.CourseName, "i");
            if (criteria.University)
                query.University = new RegExp(criteria.University, "i");
            if (criteria.courseId) query.courseId = criteria.courseId;
    
            const services = await courseModel.find(query);
            // console.log(services);
    
            const servicesWithData = await Promise.all(
                services.map(async (service) => {
                    let additionalData = {};
                    // console.log(additionalData);
                    let departmentDetails;
    
                    if (service.Department) {
                       
                        departmentDetails = await DepartmentModel.findOne({
                            departmentId: service.Department,
                        });
    
                        if (departmentDetails) {
                            additionalData.Department = departmentDetails.departmentName
                        }
                    }
                    return {
                        ...service._doc,
                        ...additionalData,
                    };
                })
            );
    
            return {
                status: "Success",
                data: {
                    items: servicesWithData,
                    totalItemsCount: servicesWithData.length,
                },
            };
        } catch (error) {
            console.error("Error:", error);
            return {
                status: "Failed",
                message: "An error occurred while processing the request.",
            };
        }
    }
    
    async getByCourseId(courseId) {
        const result = await this.model.findOne({ courseId });
        return new ServiceResponse({
            data: result,
        });
    }
    async getByCourseIdAndGroupId(groupId,Code,name) {
        const result = await this.model.findOne({ groupId:groupId,Code:Code,CourseName:name });
        return new ServiceResponse({
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
