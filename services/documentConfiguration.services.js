const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const documentConfigrationModel = require("../schema/documentConfiguration.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const documntModel = require("../schema/document.schema");
const documentCategoryModel = require("../schema/documentcategory.schema");

class documentConfiguration extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async updateUser(groupId, addmissionId, data) {
        try {
            const resp = await documentConfigrationModel.findOneAndUpdate(
                { addmissionId: addmissionId, groupId: groupId },

                data,
                { upsert: true, new: true }
            );
            return new ServiceResponse({
                data: resp,
            });
        } catch (error) {
            return new ServiceResponse({
                isError: true,
                message: error.message,
            });
        }
    }
    async deletedocumntConfigurationId(documentConfigrationId, groupId) {
        try {
            return await documentConfigrationModel.deleteOne({
                documentConfigrationId: documentConfigrationId,
                groupId: groupId,
            });
        } catch (error) {
            throw error;
        }
    }
    async updateById({ groupId, documentId, updateData }) {
        try {
            const updateResult1 = await documentConfigrationModel.updateMany(
                { "documents.documentId": documentId },
                {
                    $set: {
                        "documents.$[elem].documentTitle":
                            updateData.documentTitle,
                        "documents.$[elem].expiryDate": updateData.expiryDate,
                        "documents.$[elem].formDate": updateData.formDate,
                        "documents.$[elem].documentUrl": updateData.documentUrl,
                    },
                },
                {
                    arrayFilters: [{ "elem.documentId": documentId }],
                }
            );
            return updateResult1;
        } catch (error) {
            throw error;
        }
    }

    async updateDocumntConfigrationByConfigrationId(
        documntConfigurationId,
        groupId,
        newData
    ) {
        try {
            const updatedDocumntConfigration =
                await this.model.findOneAndUpdate(
                    {
                        documntConfigurationId: documntConfigurationId,
                        groupId: groupId,
                    },
                    newData,
                    { new: true }
                );
            return updatedDocumntConfigration;
        } catch (error) {
            throw error;
        }
    }

    async deleteById({ groupId, documentId }) {
        try {
            const documentConfiguration =
                await documentConfigrationModel.findOne({ groupId });

            if (!documentConfiguration) {
                return null;
            }

            const documentIndex = documentConfiguration.documents.findIndex(
                (doc) => doc.documentId === parseInt(documentId)
            );

            if (documentIndex === -1) {
                return null;
            }

            documentConfiguration.documents.splice(documentIndex, 1);

            await documentConfiguration.save();

            return documentConfiguration;
        } catch (error) {
            throw error;
        }
    }

    getAllDataByGroupId(groupId, criteria) {
        try {
            const searchFilter = {
                groupId: groupId,
            };

            if (criteria.search) {
                const numericSearch = parseInt(criteria.search);
                if (!isNaN(numericSearch)) {
                    searchFilter.$or = [
                        { documentConfigrationId: numericSearch },
                        { userId: numericSearch },
                        { roleId: numericSearch },
                        { addmissionId: numericSearch },
                        { empId: numericSearch },
                    ];
                } else {
                    searchFilter.$or = [];
                }
            }

            return searchFilter;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async getDocumentConfigrationData(groupId, userId, criteria) {
        try {
            const searchFilter = {
                groupId: groupId,
                userId: userId
            };
            if (criteria.userId) {
                const numericUserId = parseInt(criteria.userId);
                if (!isNaN(numericUserId)) {
                    searchFilter.userId = numericUserId;
                }
            }
            return { searchFilter };
        } catch (error) {
            throw (error);
        }
    }

    async getByRoleId(groupId, roleId, userId) {
        try {
            const documents = await documntModel.find({ groupId: groupId, roleId: roleId });
    
            const documentCategoryIds = documents.map(doc => doc.documentCategoryId);
    
            const documentCategories = await documentCategoryModel.find({
                documentCategoryId: { $in: documentCategoryIds }
            });

            const categoryMap = documentCategories.reduce((acc, category) => {
                acc[category.documentCategoryId] = category.name;
                return acc;
            }, {});
    
            const groupedDocuments = documents.reduce((acc, document) => {
                const categoryName = categoryMap[document.documentCategoryId];
                if (!acc[categoryName]) {
                    acc[categoryName] = [];
                }
                acc[categoryName].push(document);
                return acc;
            }, {});
    
            const uploadedDocuments = await documentConfigrationModel.find({ userId: userId });
    
            const groupedUploadedDocuments = uploadedDocuments.reduce((acc, document) => {
                const categoryName = categoryMap[document.documentCategoryId];
                if (!acc[categoryName]) {
                    acc[categoryName] = [];
                }
                acc[categoryName].push(document);
                return acc;
            }, {});
    
            const formattedGroupedDocuments = Object.keys(groupedDocuments).map(categoryName => {
                const uploadedDocs = groupedUploadedDocuments[categoryName] || [];
                return {
                    categoryName: categoryName,
                    documents: groupedDocuments[categoryName],
                    uploadedDocuments: uploadedDocs
                };
            });
    
            const response = {
                status: "Success",
                data: formattedGroupedDocuments
            };
    
            return response;
        } catch (err) {
            console.error("Error fetching documents:", err);
            throw err;
        }
    }    
}
module.exports = new documentConfiguration(
    documentConfigrationModel,
    "documentConfiguration"
);
