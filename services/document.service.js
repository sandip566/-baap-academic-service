const DocumentModel = require("../schema/document.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class DocumentService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getByDataId(memberId) {
        try {
            const data = await DocumentModel.findOne({ memberId: memberId });
            if (data) {
                return data
            } else {
                return { result: "Data Not Found" }
            }
        } catch (error) {
            throw error;
        }
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.roleId) query.roleId = criteria.roleId;
        if (criteria.title) query.title = new RegExp(criteria.title, "i");
        if (criteria.description) query.description = new RegExp(criteria.description, "i");
        if (criteria.category) query.category = new RegExp(criteria.category, "i");
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async updateDataById(memberId, groupId, newData) {
        try {
            const updatedData = await DocumentModel.findOneAndUpdate({ memberId: memberId, groupId: groupId }, newData, { new: true });
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async deleteByDataId(memberId, groupId) {
        try {
            const deleteData = await DocumentModel.findOneAndDelete({ memberId: memberId, groupId: groupId });
            return {
                data: deleteData,
                message: "Data deleted successfully"
            };
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new DocumentService(DocumentModel, 'document');
