const DivisionModel = require("../schema/division.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class DivisionService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async updateDivisionById(divisionId, groupId, newData) {
        try {
            const updatedData = await DivisionModel.findOneAndUpdate({ divisionId: divisionId, groupId: groupId }, newData, { new: true });
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async deleteByDivisionId(divisionId, groupId) {
        try {
            return await DivisionModel.deleteOne(divisionId, groupId);
        } catch (error) {
            throw error;
        }
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.Name) query.Name = new RegExp(criteria.Name, "i");
        if (criteria.divisionId) query.divisionId = criteria.divisionId;
        if (criteria.courseId) query.courseId = criteria.courseId;
        if (criteria.classId) query.classId = criteria.classId;
        if (criteria.incharge) query.incharge = new RegExp(criteria.incharge, "i");
        return this.preparePaginationAndReturnData(query, criteria);
    }
}
module.exports = new DivisionService(DivisionModel, 'divisions');
