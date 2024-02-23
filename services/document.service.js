const DocumentModel = require("../schema/document.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class DocumentService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getByDataId(documentId) {
        try {
            const data = await DocumentModel.findOne({ documentId: documentId });
            if (data) {
                return data
            } else {
                return { result: "Data Not Found" }
            }
        } catch (error) {
            throw error;
        }
    }

    async getByCategory(category) {
        try {
            const data = await DocumentModel.find({ category: category });
            if (data) {
                return { data }
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

    async updateDataById(documentId, groupId, newData) {
        try {
            const updatedData = await DocumentModel.findOneAndUpdate({ documentId: documentId, groupId: groupId }, newData, { new: true });
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async getAll({ user, headers, query, pagination }) {
        const paginationErrors = this.validateAndSanitizePaginationProps(pagination);
        if (paginationErrors) {
            return paginationErrors;
        }

        try {
            const items = await this.model.find(query, {}, {
                skip: pagination.pageSize * (pagination.pageNumber - 1),
                limit: pagination.pageSize,
            });
            const totalItemsCount = await this.model.countDocuments(query);

            return { items, totalItemsCount };
        } catch (error) {
            console.error("Error fetching items:", error);
            return { error: "Error fetching items" };
        }
    }

    async deleteByDataId(documentId, groupId) {
        try {
            const deleteData = await DocumentModel.findOneAndDelete({ documentId: documentId, groupId: groupId });
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
