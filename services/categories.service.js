const CategoriesModel = require("../schema/categories.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class CategoriesService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.categoriesId) query.categoriesId = criteria.categoriesId;
        if (criteria.name) query.name = new RegExp(criteria.name, "i");
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteCategories(categoriesId, groupId) { 
        try {
            return await this.dbModel.deleteOne({ categoriesId: categoriesId, groupId: groupId }); 
        } catch (error) {
            throw error;
        }
    }

    async updateCategories(categoriesId, groupId, newData) {
        try {
            const updateCategories = await this.dbModel.findOneAndUpdate(
                { categoriesId: categoriesId, groupId: groupId },
                newData,
                { new: true }
            );
            return updateCategories;
        } catch (error) {
            throw error;
        }
    }

    async deleteCategoriesById(categoriesId) {
        try {
            return await CategoriesModel.deleteOne(categoriesId);
        } catch (error) {
            throw error;
        }
    }

    async updateCategoriesById(categoriesId,newData) {
        try {
            const updateData = await CategoriesModel.findOneAndUpdate({ categoriesId: categoriesId }, newData, { new: true });
            return updateData;
        } catch (error) {
            throw error;
        }
    }

}

module.exports = new CategoriesService(CategoriesModel, 'categories');
