const DocumentCategoryModel = require("../schema/documentcategory.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class DocumentCategoryService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.roleId) query.roleId = criteria.roleId;
        if (criteria.userId) query.userId = criteria.userId;
        if (criteria.documenCategoryId) query.documenCategoryId = criteria.documenCategoryId;
        if (criteria.description)
            query.description = new RegExp(criteria.description, "i");
        return this.preparePaginationAndReturnData(query, criteria);
        
    }

    async updateDataById(documenCategoryId, groupId, newData) {
        try {
            const updatedData = await DocumentCategoryModel.findOneAndUpdate(
                { documenCategoryId:documenCategoryId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async deleteByDataId(groupId, documenCategoryId) {
        try {
            const deleteData = await DocumentCategoryModel.deleteOne({
                groupId: groupId,
                documenCategoryId: documenCategoryId,
            });
            console.log(deleteData);
            return deleteData;
        } catch (error) {
            throw error;
        }
    }

}

module.exports = new DocumentCategoryService(DocumentCategoryModel, 'documentcategory');
