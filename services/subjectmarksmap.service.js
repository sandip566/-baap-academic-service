const SubjectMarksMapModel = require("../schema/subjectmarksmap.schema");
const SubjectModel = require("../schema/subjects.schema");
const TermTypeModel = require("../schema/termType.schema");
const SemesterModel = require("../schema/semester.schema");
const ClassModel = require("../schema/classes.schema")
const BaseService = require("@baapcompany/core-api/services/base.service");

class SubjectMarksMapService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getAllByGroupId(groupId, criteria) {
        try {
            const query = {
                groupId: groupId,
            };

            if (criteria.subjectMarksMapId) {
                query.subjectMarksMapId = criteria.subjectMarksMapId;
            }

            const subjectMarksMaps = await SubjectMarksMapModel.find(query);

            const promises = subjectMarksMaps.map(async (subjectMarksMap) => {
                const { termTypeId, classId, semesterId } = subjectMarksMap;

                const termTypeQuery = termTypeId ? { termTypeId: Number(termTypeId) } : null;
                const classQuery = classId ? { classId: Number(classId) } : null;
                const semesterQuery = semesterId ? { semesterId: Number(semesterId) } : null;

                const [termType, classData, semester] = await Promise.all([
                    termTypeQuery ? TermTypeModel.findOne(termTypeQuery) : null,
                    classQuery ? ClassModel.findOne(classQuery) : null,
                    semesterQuery ? SemesterModel.findOne(semesterQuery) : null
                ]);

                return {
                    ...subjectMarksMap.toJSON(),
                    termType: termType ? termType.toJSON() : null,
                    class: classData ? classData.toJSON() : null,
                    semester: semester ? semester.toJSON() : null
                };
            });

            const result = await Promise.all(promises);
            return {
                status: "Success",
                data: result
            };
        } catch (error) {
            console.error("Error in getAllByGroupId:", error);
            throw new Error("Error fetching data");
        }
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
