const DocumentModel = require("../schema/document.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");

class DocumentService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getByDataId(documentId) {
        try {
            const data = await DocumentModel.findOne({
                documentId: documentId,
            });
            if (data) {
                return data;
            } else {
                return { result: "Data Not Found" };
            }
        } catch (error) {
            throw error;
        }
    }

    async getByCategory(category) {
        try {
            const data = await DocumentModel.find({ category: category });
            if (data) {
                return { data };
            } else {
                return { result: "Data Not Found" };
            }
        } catch (error) {
            throw error;
        }
    }

    async getAllDataByGroupId(groupId, criteria) {
        try {
            const query = {
                groupId: Number(groupId),
            };

            if (criteria.roleId) query.roleId = Number(criteria.roleId);
            if (criteria.userId) query.userId = Number(criteria.userId);
            if (criteria.title) query.title = new RegExp(criteria.title, "i");
            if (criteria.description)
                query.description = new RegExp(criteria.description, "i");

            if (criteria.userId && criteria.category) {
                query.userId = criteria.userId;
                query.category = criteria.category;
            } else {
                if (criteria.userId) query.userId = Number(criteria.userId);
                if (criteria.documentCategoryId)
                    query.documentCategoryId = Number(
                        criteria.documentCategoryId
                    );
            }

            const pageSize = Number(criteria.pageSize) || 10;
            const currentPage = Number(criteria.pageNumber) || 1;
            const skip = (currentPage - 1) * pageSize;

            let admissionData = await DocumentModel.aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: "documentcategories",
                        localField: "documentCategoryId",
                        foreignField: "documentCategoryId",
                        as: "documentCategoryId",
                    },
                },
                {
                    $unwind: {
                        path: "$documentCategoryId",
                        preserveNullAndEmptyArrays: true,
                    },
                },

                { $skip: skip },
                { $limit: pageSize },
            ]).exec();

            const totalDocuments = await DocumentModel.countDocuments(query);
            const totalPages = Math.ceil(totalDocuments / pageSize);

            const response = {
                status: "Success",
                data: { items: admissionData },
                totalItemsCount: totalDocuments,
                totalPages: totalPages,
                pageSize: pageSize,
                currentPage: currentPage,
            };

            return response;
        } catch (error) {
            console.error("Error in getAllDataByGroupId:", error);
            throw error;
        }
    }

    async updateDataById(documentId, groupId, newData) {
        try {
            const updatedData = await DocumentModel.findOneAndUpdate(
                { documentId: documentId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async getAll({ user, headers, query, pagination }) {
        const paginationErrors =
            this.validateAndSanitizePaginationProps(pagination);
        if (paginationErrors) {
            return paginationErrors;
        }
        try {
            const items = await this.model.find(
                query,
                {},
                {
                    skip: pagination.pageSize * (pagination.pageNumber - 1),
                    limit: pagination.pageSize,
                }
            );
            const totalItemsCount = await this.model.countDocuments(query);
            return { items, totalItemsCount };
        } catch (error) {
            console.error("Error fetching items:", error);
            return { error: "Error fetching items" };
        }
    }

    async deleteByDataId(documentId, groupId) {
        try {
            const deleteData = await DocumentModel.findOneAndDelete({
                documentId: documentId,
                groupId: groupId,
            });
            return {
                data: deleteData,
                message: "Data deleted successfully",
            };
        } catch (error) {
            throw error;
        }
    }

    async updateDocument(documentId, data) {
        try {
            const updateDocument = await DocumentModel.findOneAndUpdate(
                { documentId: documentId },
                data,
                { upsert: true, new: true }
            );
            return new ServiceResponse({
                data: updateDocument,
            });
        } catch (error) {
            return new ServiceResponse({
                isError: true,
                message: error.message,
            });
        }
    }

    async getByDocumentId(documentId) {
        return this.execute(() => {
            return DocumentModel.findOne({ documentId: documentId });
        });
    }
}
module.exports = new DocumentService(DocumentModel, "document");
