const documentConfigrationModel = require("../schema/documentConfigration.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class documentConfigration extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async deleteDocumentConfigrationId(documentConfigrationId, groupId) {
        try {
            return await documentConfigrationModel.deleteOne({ visitorId: visitorId, groupId: groupId });
        } catch (error) {
            throw error;
        }
    }
    async updateById({ groupId, documentId, updateData }) {
        try {
            const documentConfiguration = await documentConfigrationModel.findOne({ groupId: groupId });
           
            if (!documentConfiguration) {
                return null; 
            }

            const documentToUpdate = documentConfiguration.documents.find(doc => {
                console.log(doc.documentId)
                doc.documentId == documentId}
            )
            if (!documentToUpdate) {
                return null; 
            }
            Object.assign(documentToUpdate, updateData);
            await documentConfiguration.save();
    
            return documentToUpdate;
        } catch (error) {
            throw error;
        }
    }
    

    async deleteById({ groupId, documentId }) {
        try {
            const documentConfiguration = await documentConfigrationModel.findOne({ groupId });

            if (!documentConfiguration) {
                return null;
            }

            const documentIndex = documentConfiguration.documents.findIndex(doc => doc.documentId === parseInt(documentId));

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
        const query = {
            groupId: groupId,
        };
        if (criteria.documentConfigrationId) query.documentConfigrationId = criteria.documentConfigrationId;
        return this.preparePaginationAndReturnData(query, criteria);
    }
}
module.exports = new documentConfigration(documentConfigrationModel, 'documentConfigration');
