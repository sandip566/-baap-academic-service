const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const documentConfigrationModel = require("../schema/documentConfigration.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class documentConfigration extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async updateUser(addmissionId, groupId, data) {
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
        if (criteria.userId) query.userId = criteria.userId;
        if (criteria.roleId) query.roleId = criteria.roleId;
        if (criteria.addmissionId) query.addmissionId = criteria.addmissionId;
        if (criteria.academicYear) query.academicYear = criteria.academicYear;
        if (criteria.empId) query.empId = criteria.empId;
        return this.preparePaginationAndReturnData(query, criteria);
    }
}
module.exports = new documentConfigration(documentConfigrationModel, 'documentConfigration');
