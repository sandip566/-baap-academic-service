const DocumentModel = require("../schema/document.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");

class DocumentService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async saveData(topic) {
        try {
            const document = await DocumentModel.create(topic);
            if (!document) {
                return new ServiceResponse({
                    message: "Data not saved",
                    isError: true,
                });
            }
            return document
        } catch (err) {
            throw err;
        }
    }

    async getBymemberId(memberId) {
        return this.execute(() => {
            return DocumentModel.findOne({ memberId: memberId });
        });
    }

    async updateData(memberId, data) {
        try {
            const resp = await DocumentModel.findOneAndUpdate(
                { memberId: memberId },
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
        if (criteria.description) query.description = criteria.description;
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
